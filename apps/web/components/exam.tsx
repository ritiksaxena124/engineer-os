'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge, Button, Panel } from '@/components/ui';
import { RungLabel } from '@/components/rung';
import { Empty, Failure, Loading } from '@/components/states';
import { Prose } from '@/components/prose';
import { api, ApiError } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import { answerDepth, asVerdict, partTone, phaseStandings, verdictTone, type PhaseStanding } from '@/lib/view';
import type { ExamItem, ExamReport, ExamSession, Phase, Topic } from '@/lib/types';

/** Drafts live per phase: a paper for P01 must never open on top of P00's half-typed answers. */
const sessionKey = (phase: string) => `eos.exam.${phase}.session`;
const answersKey = (phase: string) => `eos.exam.${phase}.answers`;
const reportKey = (phase: string) => `eos.exam.${phase}.report`;

/** The control plane owns the refusal; the screen only reads the specifics out of its details. */
interface Refusal extends ApiError {
  details: {
    blocked?: { slug: string; title: string; level: number }[];
    missingParts?: { key: string; label: string }[];
  } | null;
}

/**
 * The exam is a phase's judgment, so this screen's job is to make the seven kinds of work visible
 * before someone commits an hour and a half, and to report a failure as the parts that did not
 * hold rather than as a number. A pass is the only thing that names the next phase.
 */
export function Exam() {
  const phases = useQuery<{ phases: Phase[] }>('curriculum/phases');
  const topics = useQuery<{ topics: Topic[] }>('curriculum/topics');
  const standings = useMemo(
    () => (phases.data && topics.data ? phaseStandings(phases.data.phases, topics.data.topics) : []),
    [phases.data, topics.data],
  );
  const titles = useMemo(
    () => Object.fromEntries((topics.data?.topics ?? []).map((topic) => [topic.slug, topic.title])),
    [topics.data],
  );

  const [chosen, setChosen] = useState<string | null>(null);
  const [session, setSession] = useState<ExamSession | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [report, setReport] = useState<ExamReport | null>(null);
  const [refusal, setRefusal] = useState<Refusal | null>(null);
  const [busy, setBusy] = useState(false);

  const error = phases.error ?? topics.error;
  const selected =
    standings.find((entry) => entry.key === chosen) ?? standings.find((entry) => entry.ready) ?? standings[0] ?? null;
  const stage = report ? 'reported' : session ? 'sitting' : 'idle';

  // A 175-minute paper cannot afford to live in component state alone, so an open session and its
  // drafts survive a refresh. Switching phases re-reads that phase's own storage.
  useEffect(() => {
    if (!selected) return;
    const storedReport = sessionStorage.getItem(reportKey(selected.key));
    const storedSession = sessionStorage.getItem(sessionKey(selected.key));
    if (storedReport) {
      setReport(JSON.parse(storedReport) as ExamReport);
      setSession(null);
      setAnswers({});
      return;
    }
    if (storedSession) {
      setSession(JSON.parse(storedSession) as ExamSession);
      setAnswers(JSON.parse(sessionStorage.getItem(answersKey(selected.key)) ?? '{}') as Record<string, string>);
      return;
    }
    setReport(null);
    setSession(null);
    setAnswers({});
  }, [selected]);

  function clear(phaseKey: string) {
    sessionStorage.removeItem(sessionKey(phaseKey));
    sessionStorage.removeItem(answersKey(phaseKey));
    sessionStorage.removeItem(reportKey(phaseKey));
    setSession(null);
    setAnswers({});
    setReport(null);
    setRefusal(null);
  }

  async function open() {
    if (!selected) return;
    setBusy(true);
    setRefusal(null);
    try {
      const opened = await api.post<ExamSession>('assessments/exam', { phaseKey: selected.key });
      sessionStorage.setItem(sessionKey(opened.phaseKey), JSON.stringify(opened));
      sessionStorage.setItem(answersKey(opened.phaseKey), '{}');
      setSession(opened);
      setAnswers({});
      setReport(null);
    } catch (cause) {
      setRefusal(cause as Refusal);
    } finally {
      setBusy(false);
    }
  }

  function type(slug: string, value: string) {
    if (!session) return;
    const next = { ...answers, [slug]: value };
    setAnswers(next);
    sessionStorage.setItem(answersKey(session.phaseKey), JSON.stringify(next));
  }

  async function submit() {
    if (!session) return;
    const payload = session.parts
      .flatMap((part) => part.items)
      .filter((item) => (answers[item.slug] ?? '').trim().length > 0)
      .map((item) => ({ slug: item.slug, answerText: answers[item.slug] }));
    if (payload.length === 0) return;

    setBusy(true);
    setRefusal(null);
    try {
      const graded = await api.post<ExamReport>('assessments/exam/submit', {
        sessionId: session.sessionId,
        answers: payload,
      });
      clear(session.phaseKey);
      sessionStorage.setItem(reportKey(graded.phaseKey), JSON.stringify(graded));
      setReport(graded);
    } catch (cause) {
      setRefusal(cause as Refusal);
    } finally {
      setBusy(false);
    }
  }

  if (error) return <Failure error={error} onRetry={phases.reload} />;
  if (phases.loading || topics.loading) return <Loading label="reading the graph" />;
  if (!selected) return <Empty title="The graph has no phases." />;

  const items = session?.parts.flatMap((part) => part.items) ?? [];
  const answered = items.filter((item) => (answers[item.slug] ?? '').trim().length > 0).length;

  return (
    <div className="space-y-4">
      <header className="border-b border-line pb-4">
        <p className="text-[11px] uppercase tracking-wide text-dim">assessment</p>
        <h1 className="mt-1 text-[20px] tracking-tight text-ink">
          Phase exam <span className="text-muted">· P{String(selected.number).padStart(2, '0')} {selected.title}</span>
        </h1>
        <p className="mt-1 max-w-[74ch] text-[13px] leading-relaxed text-muted">
          Seven parts, seven kinds of work: theory, implementation, debugging, architecture, production, an interview
          and a teach-back. Every part has to hold — being strong in five of them is not a pass, and a pass is the only
          thing that opens the next phase.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-1.5">
        {standings
          .filter((entry, index) => entry.ready || index <= firstReady(standings) || entry.key === selected.key)
          .map((entry) => (
            <button
              key={entry.key}
              onClick={() => setChosen(entry.key)}
              className={`rounded-control border px-2.5 py-1 text-[12px] transition-colors ${
                entry.key === selected.key
                  ? 'border-accent/50 bg-accent/15 text-accent'
                  : 'border-line-strong text-muted hover:bg-raised hover:text-ink'
              }`}
              title={entry.ready ? `${entry.title} — sittable` : `${entry.open} of ${entry.total} topics open`}
            >
              <span className="numeric">P{String(entry.number).padStart(2, '0')}</span>{' '}
              <span className={entry.ready ? 'text-ink' : 'text-dim'}>{entry.title}</span>
            </button>
          ))}
        {firstReady(standings) < standings.length - 1 && (
          <span className="px-1 text-[11px] text-dim">
            {standings.length - 1 - firstReady(standings)} later phases are gated
          </span>
        )}
      </div>

      {refusal && <Refused refusal={refusal} onRetry={open} onAbandon={() => clear(selected.key)} />}

      {stage === 'idle' && !refusal && (
        <Panel
          title="Before you start"
          aside={selected.ready ? `${selected.open} of ${selected.total} topics open` : `${selected.open}/${selected.total} open`}
        >
          {selected.ready ? (
            <>
              <ul className="space-y-2 text-[13px] leading-relaxed text-muted">
                <li>Sit it in one go and hand it in. The answer models stay closed — the report names what you missed, never what the answer was.</li>
                <li>Each part carries its own instruction and clock. A part is a claim about a different kind of work, so an answer written for one will not hold in another.</li>
                <li>Retaking hands out the same paper. That is the point: a retake tests the same claim, not an easier one.</li>
              </ul>
              <div className="mt-4">
                <Button busy={busy} onClick={open}>
                  Open the paper
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="max-w-[74ch] text-[13px] leading-relaxed text-muted">
                Not reached. An exam over topics you cannot open yet measures the gap above the phase instead of the
                phase, so the control plane refuses it. These topics still need their prerequisites held:
              </p>
              <ul className="mt-3 divide-y divide-line">
                {selected.blocked.map((topic) => (
                  <li key={topic.slug} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
                    <Link href={`/topics/${topic.slug}`} className="min-w-0 truncate text-[12px] text-ink hover:underline">
                      {topic.title}
                    </Link>
                    <RungLabel level={topic.level} />
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[12px] text-muted">
                <Link href="/path" className="text-accent hover:underline">
                  Open the learning path
                </Link>{' '}
                to see which prerequisite is holding each one.
              </p>
            </>
          )}
        </Panel>
      )}

      {stage === 'sitting' && session && (
        <>
          <div className="sticky top-0 z-10 -mx-6 border-b border-line bg-canvas/95 px-6 py-3 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[12px] text-muted">
                <span className="numeric text-ink">{answered}</span> of {items.length} answered ·{' '}
                {session.plannedMinutes} minute plan
                {session.shortParts.length > 0 && (
                  <span className="text-dim"> · short paper: {session.shortParts.join(', ')}</span>
                )}
              </span>
              <span className="flex items-center gap-3">
                <Button variant="ghost" onClick={() => clear(session.phaseKey)}>
                  Abandon
                </Button>
                <Button busy={busy} onClick={submit} disabled={answered === 0}>
                  {answered === items.length ? 'Hand it in' : `Hand in ${answered} answered`}
                </Button>
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {session.parts.map((part) => (
              <section key={part.key} className="rounded-panel border border-line bg-surface">
                <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-line px-4 py-2.5">
                  <h2 className="text-[13px] text-ink">{part.label}</h2>
                  <span className="flex items-center gap-2 text-[11px] text-dim">
                    <Badge tone={part.short ? 'due' : 'neutral'}>
                      {part.short ? `${part.items.length} handed out · fewer authored` : `${part.items.length} items`}
                    </Badge>
                    <span className="numeric">{part.minutes} min</span>
                  </span>
                </header>
                <p className="max-w-[78ch] border-b border-line px-4 py-2.5 text-[12px] leading-relaxed text-muted">
                  {part.instructions}
                </p>
                <div className="space-y-3 px-4 py-3">
                  {part.items.map((item, index) => (
                    <ItemCard
                      key={item.slug}
                      item={item}
                      index={index}
                      title={titles[item.topicSlug] ?? item.topicSlug}
                      value={answers[item.slug] ?? ''}
                      onChange={type}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}

      {stage === 'reported' && report && (
        <Readout report={report} titles={titles} onResit={() => clear(report.phaseKey)} />
      )}
    </div>
  );
}

function verdictLabel(slug: string, titles: Record<string, string>) {
  if (!slug.startsWith('teach-back::')) return slug;
  const topic = slug.slice('teach-back::'.length);
  return `teach-back · ${titles[topic] ?? topic}`;
}

function firstReady(standings: PhaseStanding[]) {
  const index = standings.findIndex((entry) => entry.ready);
  return index === -1 ? 0 : index;
}

function Refused({
  refusal,
  onRetry,
  onAbandon,
}: {
  refusal: Refusal;
  onRetry: () => void;
  onAbandon: () => void;
}) {
  const blocked = refusal.details?.blocked ?? [];
  const missing = refusal.details?.missingParts ?? [];

  return (
    <Panel title="Refused" aside={`${refusal.code}${refusal.requestId ? ` · ${refusal.requestId}` : ''}`}>
      <p className="max-w-[74ch] text-[13px] leading-relaxed text-weak">{refusal.message}</p>

      {blocked.length > 0 && (
        <ul className="mt-3 divide-y divide-line">
          {blocked.map((topic) => (
            <li key={topic.slug} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
              <Link href={`/topics/${topic.slug}`} className="min-w-0 truncate text-[12px] text-ink hover:underline">
                {topic.title}
              </Link>
              <RungLabel level={topic.level} />
            </li>
          ))}
        </ul>
      )}

      {missing.length > 0 && (
        <p className="mt-3 max-w-[74ch] text-[12px] leading-relaxed text-muted">
          Unauthored parts: {missing.map((part) => part.label).join(', ')}. The paper will not be padded with questions
          from the wrong family to make it look complete — those parts get written, then the phase is examinable.
        </p>
      )}

      <div className="mt-3 flex gap-3">
        <Button variant="ghost" onClick={onRetry}>
          Try again
        </Button>
        <Button variant="danger" onClick={onAbandon}>
          Clear this phase
        </Button>
      </div>
    </Panel>
  );
}

function ItemCard({
  item,
  index,
  title,
  value,
  onChange,
}: {
  item: ExamItem;
  index: number;
  title: string;
  value: string;
  onChange: (slug: string, value: string) => void;
}) {
  const depth = answerDepth(value.trim().length);

  return (
    <article className="rounded-panel border border-line bg-raised">
      <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-line px-3.5 py-2">
        <span className="numeric text-[11px] text-dim">{index + 1}</span>
        <span className="flex items-center gap-2">
          <Badge tone="neutral">{item.category}</Badge>
          <span className="text-[11px] text-dim">
            D{item.difficulty} · {item.levelKey} · {item.conceptCount} concepts
          </span>
          <Link href={`/topics/${item.topicSlug}`} className="text-[11px] text-dim underline-offset-2 hover:text-ink hover:underline">
            {title}
          </Link>
        </span>
      </header>
      <div className="space-y-2 px-3.5 py-2.5">
        <p className="max-w-[74ch] text-[13px] leading-relaxed text-ink">{item.stem}</p>
        {item.body && <Prose text={item.body} className="text-[12px] leading-relaxed text-muted" />}
        <textarea
          className="min-h-[150px] w-full resize-y rounded-control border border-line-strong bg-canvas px-3 py-2.5 text-[13px] leading-relaxed text-ink placeholder:text-dim"
          placeholder="Mechanism, order, cost — then the failure it prevents."
          maxLength={20_000}
          value={value}
          onChange={(event) => onChange(item.slug, event.target.value)}
        />
        <div className="flex items-center justify-between text-[11px]">
          <span className="numeric text-dim">{value.trim().length} characters</span>
          <Badge tone={depth.tone}>{depth.label}</Badge>
        </div>
      </div>
    </article>
  );
}

function Readout({
  report,
  titles,
  onResit,
}: {
  report: ExamReport;
  titles: Record<string, string>;
  onResit: () => void;
}) {
  const held = report.parts.filter((part) => part.passed).length;

  return (
    <div className="space-y-4">
      <Panel
        title={report.passed ? 'Passed' : 'Not passed'}
        aside={`${held} of ${report.parts.length} parts held · ${report.score}`}
      >
        <p className="max-w-[78ch] text-[13px] leading-relaxed text-muted">
          {report.passed
            ? `Every part held, which is what a phase exam is for. ${report.nextPhase?.title ?? 'The next phase'} is now recommended — not because the paper ended, because it ended well.`
            : `A phase is not passed by being strong in most of the kinds of work. ${
                report.failedParts.length
              } part${report.failedParts.length === 1 ? '' : 's'} did not hold: ${report.failedParts
                .map((part) => part.label)
                .join(', ')}. Nothing above this phase opens from it.`}
        </p>
        {report.passed && report.nextPhase && (
          <div className="mt-3">
            <Link
              href="/path"
              className="text-[12px] text-accent underline-offset-2 hover:underline"
            >
              Next: P{report.nextPhase.key.replace(/\D/g, '')} — {report.nextPhase.title}
            </Link>
          </div>
        )}
      </Panel>

      <Panel title="Part by part" aside="a part holds on its own score, answered and over the line">
        <ul className="divide-y divide-line">
          {report.parts.map((part) => (
            <li key={part.key} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2 first:pt-0 last:pb-0">
              <Badge tone={partTone(part)}>{part.passed ? 'held' : part.answered === 0 ? 'not attempted' : 'failed'}</Badge>
              <span className="min-w-0 flex-1 truncate text-[12px] text-ink">{part.label}</span>
              <span className="numeric text-[11px] text-dim">
                {part.answered}/{part.items} answered · {part.score}
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      {report.promotions.length > 0 && (
        <Panel title="What the answers moved" aside="promotion is earned by the attempt, not by the pass">
          <ul className="divide-y divide-line">
            {report.promotions.map((promotion) => (
              <li key={promotion.topicSlug} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
                <Link href={`/topics/${promotion.topicSlug}`} className="min-w-0 truncate text-[12px] text-ink hover:underline">
                  {titles[promotion.topicSlug] ?? promotion.topicSlug}
                </Link>
                <span className="flex items-center gap-2">
                  <span className="text-[11px] text-dim">L{promotion.previousLevel} →</span>
                  <RungLabel level={promotion.level} levelKey={promotion.levelKey} />
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Panel title="Item by item" aside="models stay closed; a drill on the topic opens its own">
        <ul className="divide-y divide-line">
          {report.verdicts.map((row) => (
            <li key={row.slug} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2 first:pt-0 last:pb-0">
              <Badge tone={verdictTone(asVerdict(row.verdict))}>{row.verdict}</Badge>
              <span className="text-[11px] text-dim">{row.part}</span>
              {row.slug.startsWith('teach-back::') ? (
                <Link
                  href={`/topics/${row.slug.slice('teach-back::'.length)}`}
                  className="min-w-0 truncate text-[12px] text-muted hover:text-ink hover:underline"
                >
                  {verdictLabel(row.slug, titles)}
                </Link>
              ) : (
                <Link href={`/practice/${row.slug}`} className="min-w-0 truncate text-[12px] text-muted hover:text-ink hover:underline">
                  {row.slug}
                </Link>
              )}
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
        <p className="max-w-[64ch] text-[11px] text-dim">
          Blanks are graded as zeros here, unlike the diagnostic: an exam is the judgment, not a sample. Repair the
          parts that did not hold, then hand the same paper in again.
        </p>
        <Button variant="ghost" onClick={onResit}>
          Sit it again
        </Button>
      </div>
    </div>
  );
}
