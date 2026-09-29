'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Button, Panel } from '@/components/ui';
import { Empty } from '@/components/states';
import { api, ApiError } from '@/lib/api';
import { answerDepth, asVerdict, verdictTone } from '@/lib/view';
import type { DiagnosticItem, DiagnosticReport, DiagnosticSession } from '@/lib/types';

const SESSION_KEY = 'eos.diagnostic.session';
const ANSWERS_KEY = 'eos.diagnostic.answers';
const REPORT_KEY = 'eos.diagnostic.report';

type Stage = 'loading' | 'intro' | 'sitting' | 'reported';

interface Failure {
  error: ApiError;
  /** The refusal came from an action, so the retry has to be that same action, not a generic reload. */
  retry: () => void;
}

/**
 * The diagnostic is a placement instrument, so the screen refuses to turn it into a score: it
 * reports which skills the missed concepts cluster under and what the first repair for each one
 * is. It writes attempts and promotes nothing, and says so on the page that writes them.
 */
export function Diagnostic() {
  const [stage, setStage] = useState<Stage>('loading');
  const [session, setSession] = useState<DiagnosticSession | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [busy, setBusy] = useState(false);

  // Thirty answers take an hour of typing, so the open session and its drafts survive a refresh in
  // sessionStorage. The control plane keeps a session open until it is submitted, so resuming the
  // draft is resuming a real session rather than a stale copy of one.
  useEffect(() => {
    const storedReport = sessionStorage.getItem(REPORT_KEY);
    const storedSession = sessionStorage.getItem(SESSION_KEY);
    if (storedReport) {
      setReport(JSON.parse(storedReport) as DiagnosticReport);
      setStage('reported');
      return;
    }
    if (storedSession) {
      setSession(JSON.parse(storedSession) as DiagnosticSession);
      setAnswers(JSON.parse(sessionStorage.getItem(ANSWERS_KEY) ?? '{}') as Record<string, string>);
      setStage('sitting');
      return;
    }
    setStage('intro');
  }, []);

  function forget() {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(ANSWERS_KEY);
    sessionStorage.removeItem(REPORT_KEY);
    setSession(null);
    setAnswers({});
    setReport(null);
    setFailure(null);
    setStage('intro');
  }

  async function start() {
    setBusy(true);
    setFailure(null);
    try {
      const opened = await api.post<DiagnosticSession>('assessments/diagnostic');
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(opened));
      sessionStorage.setItem(ANSWERS_KEY, '{}');
      setSession(opened);
      setAnswers({});
      setStage('sitting');
    } catch (cause) {
      setFailure({ error: cause as ApiError, retry: start });
    } finally {
      setBusy(false);
    }
  }

  function type(slug: string, value: string) {
    const next = { ...answers, [slug]: value };
    setAnswers(next);
    sessionStorage.setItem(ANSWERS_KEY, JSON.stringify(next));
  }

  async function submit() {
    if (!session) return;
    const payload = session.items
      .filter((item) => (answers[item.slug] ?? '').trim().length > 0)
      .map((item) => ({ slug: item.slug, answerText: answers[item.slug] }));
    if (payload.length === 0) return;

    setBusy(true);
    setFailure(null);
    try {
      const graded = await api.post<DiagnosticReport>('assessments/diagnostic/submit', {
        sessionId: session.sessionId,
        answers: payload,
      });
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(ANSWERS_KEY);
      sessionStorage.setItem(REPORT_KEY, JSON.stringify(graded));
      setReport(graded);
      setStage('reported');
    } catch (cause) {
      setFailure({ error: cause as ApiError, retry: submit });
    } finally {
      setBusy(false);
    }
  }

  const answered = session ? session.items.filter((item) => (answers[item.slug] ?? '').trim().length > 0).length : 0;

  return (
    <div className="space-y-4">
      <header className="border-b border-line pb-4">
        <p className="text-[11px] uppercase tracking-wide text-dim">assessment</p>
        <h1 className="mt-1 text-[20px] tracking-tight text-ink">Diagnostic</h1>
        <p className="mt-1 max-w-[70ch] text-[13px] leading-relaxed text-muted">
          {stage === 'reported'
            ? 'Read the gaps, not a number. This decided where the graph opens, and nothing else.'
            : 'One question per area, written out in full. It measures what you can reproduce, so a blank is worse than a wrong answer — a wrong one names a concept to go and learn.'}
        </p>
      </header>

      {failure && (
        <Panel title="Refused" aside={failure.error.code}>
          <p className="text-[13px] text-weak">{failure.error.message}</p>
          <div className="mt-3 flex gap-3">
            <Button variant="ghost" busy={busy} onClick={failure.retry}>
              Try again
            </Button>
            <Button variant="danger" onClick={forget}>
              Abandon and open a new session
            </Button>
          </div>
        </Panel>
      )}

      {stage === 'loading' && <p className="text-[12px] text-dim">reading the last session…</p>}

      {stage === 'intro' && (
        <Panel title="Before you start">
          <ul className="space-y-2 text-[13px] leading-relaxed text-muted">
            <li>Sit it in one go. The answer models stay closed until the set is submitted — that is the measurement, not a restriction.</li>
            <li>Write what happens, in what order, and what it costs. Naming the pieces is not an explanation, and the grader knows the difference.</li>
            <li>Nothing here moves a rung. Promotion comes from drills on topics the graph has unlocked for you.</li>
          </ul>
          <div className="mt-4">
            <Button busy={busy} onClick={start}>
              Open a session
            </Button>
          </div>
        </Panel>
      )}

      {stage === 'sitting' && session && (
        <>
          <div className="sticky top-0 z-10 -mx-6 border-b border-line bg-canvas/95 px-6 py-3 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[12px] text-muted">
                <span className="numeric text-ink">{answered}</span> of {session.items.length} answered ·{' '}
                {session.plannedMinutes} minute plan
              </span>
              <Button busy={busy} onClick={submit} disabled={answered === 0}>
                {answered === session.items.length ? 'Submit' : `Submit ${answered} answered`}
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            {session.items.map((item, index) => (
              <ItemCard key={item.slug} item={item} index={index} value={answers[item.slug] ?? ''} onChange={type} />
            ))}
          </div>
        </>
      )}

      {stage === 'reported' && report && <Readout report={report} onRestart={forget} />}
    </div>
  );
}

function ItemCard({
  item,
  index,
  value,
  onChange,
}: {
  item: DiagnosticItem;
  index: number;
  value: string;
  onChange: (slug: string, value: string) => void;
}) {
  const depth = answerDepth(value.trim().length);

  return (
    <section className="rounded-panel border border-line bg-surface">
      <header className="flex items-baseline justify-between gap-4 border-b border-line px-4 py-2.5">
        <span className="numeric text-[11px] text-dim">Q{index + 1}</span>
        <span className="flex items-center gap-2">
          <Badge tone="neutral">{item.category}</Badge>
          <span className="text-[11px] text-dim">
            D{item.difficulty} · {item.levelKey} · {item.conceptCount} concepts
          </span>
        </span>
      </header>
      <div className="space-y-2 px-4 py-3">
        <p className="max-w-[74ch] text-[13px] leading-relaxed text-ink">{item.stem}</p>
        {item.body && (
          <p className="max-w-[74ch] whitespace-pre-line text-[12px] leading-relaxed text-muted">{item.body}</p>
        )}
        <textarea
          className="min-h-[140px] w-full resize-y rounded-control border border-line-strong bg-canvas px-3 py-2.5 text-[13px] leading-relaxed text-ink placeholder:text-dim"
          placeholder="Mechanism, order, cost — then the failure mode."
          maxLength={20_000}
          value={value}
          onChange={(event) => onChange(item.slug, event.target.value)}
        />
        <div className="flex items-center justify-between text-[11px]">
          <span className="numeric text-dim">{value.trim().length} characters</span>
          <Badge tone={depth.tone}>{depth.label}</Badge>
        </div>
      </div>
    </section>
  );
}

function Readout({ report, onRestart }: { report: DiagnosticReport; onRestart: () => void }) {
  return (
    <div className="space-y-4">
      <Panel title="What it read" aside={`${report.answered} graded · ${report.unanswered} left blank`}>
        <p className="max-w-[78ch] text-[13px] leading-relaxed text-muted">
          {report.answered > 0
            ? `${report.answered} answer${report.answered === 1 ? '' : 's'} were long enough to judge. Blanks are reported and never recorded, because an empty page is not a measurement.`
            : 'Nothing written was assessable. This session is closed, so the set has to be sat again before anything can be read.'}
        </p>
      </Panel>

      {report.reading.length === 0 ? (
        <Empty title="No concept gaps to cluster." >Everything that was answered touched its load-bearing concepts.</Empty>
      ) : (
        <Panel title="Where the gaps cluster" aside="by skill, most missed first">
          <ul className="divide-y divide-line">
            {report.reading.map((row) => (
              <li key={row.skill} className="py-2.5 first:pt-0 last:pb-0">
                <p className="text-[12px] text-ink">
                  {row.skill} <span className="text-dim">· {row.misses} missed concept{row.misses === 1 ? '' : 's'}</span>
                </p>
                <p className="mt-1 max-w-[78ch] text-[12px] leading-relaxed text-muted">{row.firstRepair}</p>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Topics with the most gaps">
          {report.weakTopics.length === 0 ? (
            <Empty title="No topic collected a gap." />
          ) : (
            <ul className="divide-y divide-line">
              {report.weakTopics.map((topic) => (
                <li key={topic.slug} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
                  <Link href={`/topics/${topic.slug}`} className="min-w-0 hover:underline">
                    <span className="block truncate text-[12px] text-ink">{topic.title}</span>
                    <span className="block truncate text-[11px] text-dim">{topic.slug}</span>
                  </Link>
                  <Badge tone={topic.misses >= 3 ? 'weak' : 'due'}>{topic.misses} missed</Badge>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Repair path" aside="the graph under your weakest topic">
          {report.repairPath.length === 0 ? (
            <Empty title="Nothing underneath it." >
              The gap is in the topic itself, not in a prerequisite it depends on.
            </Empty>
          ) : (
            <ol className="space-y-1.5">
              {report.repairPath.map((step, index) => (
                <li key={step.slug} className="flex items-baseline gap-2 text-[12px]">
                  <span className="numeric text-dim">{index + 1}</span>
                  <Link href={`/topics/${step.slug}`} className="text-accent hover:underline">
                    {step.title}
                  </Link>
                  <span className="text-[11px] text-dim">
                    {step.phaseKey} · L{step.currentLevel}
                  </span>
                </li>
              ))}
            </ol>
          )}
          <p className="mt-3 text-[12px] text-muted">
            <Link href="/path" className="text-accent hover:underline">
              Open the learning path
            </Link>{' '}
            — the first repair is a way of working, not a reading list.
          </p>
        </Panel>
      </div>

      <Panel title="Item by item" aside="models stay closed here; a drill opens its own">
        <ul className="divide-y divide-line">
          {report.verdicts.map((row) => (
            <li key={row.slug} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2 first:pt-0 last:pb-0">
              <Badge tone={verdictTone(asVerdict(row.verdict))}>{row.verdict}</Badge>
              <Link href={`/practice/${row.slug}`} className="min-w-0 truncate text-[12px] text-muted hover:text-ink hover:underline">
                {row.slug}
              </Link>
              {row.missing.length > 0 && (
                <span className="text-[11px] text-dim">
                  missing {row.missing.slice(0, 3).join(', ')}
                  {row.missing.length > 3 ? '…' : ''}
                </span>
              )}
            </li>
          ))}
        </ul>
      </Panel>

      <div className="flex items-center justify-between gap-4 border-t border-line pt-3">
        <p className="max-w-[60ch] text-[11px] text-dim">
          Promotions come from drills on unlocked topics, not from this report. The graph has already opened what your answers justify.
        </p>
        <Button variant="ghost" onClick={onRestart}>
          Sit it again
        </Button>
      </div>
    </div>
  );
}
