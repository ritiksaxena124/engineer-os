'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Badge, Button, Panel } from '@/components/ui';
import { Empty, Failure, Loading } from '@/components/states';
import { Prose } from '@/components/prose';
import { RungLabel } from '@/components/rung';
import { useQuery } from '@/lib/useQuery';
import { api, ApiError } from '@/lib/api';
import { PASS_SCORE, difficultyLabel, shortDate, verdictTone } from '@/lib/view';
import type { AnswerModel, AttemptResult, QuestionSummary, Standing } from '@/lib/types';

export function PracticeAttempt() {
  const { slug = '' } = useParams<{ slug: string }>();
  const question = useQuery<{ question: QuestionSummary }>(`questions/${slug}`);
  const standings = useQuery<{ standings: Standing[] }>('mastery');
  const [text, setText] = useState('');
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [refused, setRefused] = useState<ApiError | null>(null);
  const [busy, setBusy] = useState(false);

  if (question.error) return <Failure error={question.error} onRetry={question.reload} />;
  if (question.loading || !question.data) return <Loading label="loading the drill" />;

  const row = question.data.question;
  const standing = standings.data?.standings.find((entry) => entry.topicSlug === row.topicSlug);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setRefused(null);
    try {
      setResult(await api.post<AttemptResult>(`questions/${slug}/attempt`, { answerText: text }));
      question.reload();
    } catch (cause) {
      const failure = cause as ApiError;
      setRefused(failure);
      toast.error(failure.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <header className="border-b border-line pb-4">
        <p className="text-[11px] uppercase tracking-wide text-dim">
          <Link href={`/topics/${row.topicSlug}`} className="hover:text-ink hover:underline">
            {row.topicSlug}
          </Link>
          {' '}· {row.categoryLabel ?? row.category} · {difficultyLabel(row)} · {row.levelKey}
        </p>
        <div className="mt-1 flex items-start justify-between gap-6">
          <h1 className="max-w-[70ch] text-[17px] leading-snug tracking-tight text-ink">{row.stem}</h1>
          <span className="shrink-0">{standing ? <RungLabel level={standing.level} levelKey={standing.levelKey} /> : <RungLabel level={0} levelKey="exposure" />}</span>
        </div>
        {row.body && <Prose text={row.body} className="mt-2 text-[12px] leading-relaxed text-muted" />}
      </header>

      {refused && refused.code === 'TOPIC_LOCKED' && (
        <LockedNotice error={refused} topicSlug={row.topicSlug} />
      )}

      <Panel title="Your answer" aside={result ? undefined : `${row.attemptCount ?? 0} attempts on record · the model opens after you submit`}>
        <form onSubmit={submit} className="space-y-3">
          <textarea
            className="min-h-[220px] w-full resize-y rounded-control border border-line-strong bg-canvas px-3 py-2.5 text-[13px] leading-relaxed text-ink placeholder:text-dim"
            placeholder="What happens, in what order, and what it costs. Naming the pieces is not an explanation."
            value={text}
            maxLength={20_000}
            onChange={(event) => setText(event.target.value)}
          />
          <div className="flex items-center justify-between">
            <span className="numeric text-[11px] text-dim">{text.trim().length} characters</span>
            <Button type="submit" busy={busy} disabled={text.trim().length === 0}>
              {result ? 'Answer again' : 'Submit for grading'}
            </Button>
          </div>
        </form>
      </Panel>

      {result && <Verdict result={result} />}
      {result?.answer && <Reveal model={result.answer} />}
      {!result && (row.attemptCount ?? 0) > 0 && row.answer && (
        <Reveal model={row.answer} note="revealed because you have answered this before" />
      )}
      {!result && (row.attemptCount ?? 0) === 0 && (
        <Empty title="The answer model stays closed until an attempt exists." >
          That is not a UI trick: the grader reads what you wrote before anything is shown to you.
        </Empty>
      )}
    </div>
  );
}

function Verdict({ result }: { result: AttemptResult }) {
  const passed = result.score >= PASS_SCORE;
  return (
    <Panel
      title="Evaluation"
      aside={
        <span className="flex items-center gap-2">
          <Badge tone={verdictTone(result.verdict)}>{result.verdict}</Badge>
          <span className={`numeric text-[12px] ${passed ? 'text-held' : 'text-weak'}`}>{result.score}/100</span>
        </span>
      }
    >
      <p className="max-w-[74ch] text-[13px] leading-relaxed text-ink">{result.feedback}</p>

      {result.missing.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] uppercase tracking-wide text-dim">Not touched</p>
          <ul className="mt-1 flex flex-wrap gap-1">
            {result.missing.map((name) => (
              <li key={name}>
                <Badge tone="weak">{name}</Badge>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-3 text-[11px] text-dim">
        <span>coverage {(result.coverage * 100).toFixed(0)}%</span>
        {result.evidence && (
          <span>
            standing:{' '}
            <span className={result.evidence.level > result.evidence.previousLevel ? 'text-held' : 'text-weak'}>
              L{result.evidence.previousLevel} → L{result.evidence.level} ({result.evidence.levelKey})
            </span>
          </span>
        )}
        {result.review && (
          <span>
            review: {result.review.intervalDays} d · {new Date(result.review.dueAt).toDateString()}
            {result.review.lapseCount > 0 ? ` · lapsed ×${result.review.lapseCount}` : ''}
          </span>
        )}
      </div>
    </Panel>
  );
}

const MODEL: { key: keyof AnswerModel; label: string; hint: string }[] = [
  { key: 'shortAnswer', label: 'Short answer', hint: 'the sentence you should be able to say cold' },
  { key: 'idealAnswer', label: 'Ideal answer', hint: 'what a working engineer writes' },
  { key: 'deepAnswer', label: 'Deeper', hint: 'the internals behind it' },
  { key: 'commonMistakes', label: 'Common mistakes', hint: 'what learners write with confidence' },
  { key: 'whyWrong', label: 'Why those are wrong', hint: 'the failure each one causes' },
  { key: 'followUps', label: 'Follow-ups', hint: 'the questions that keep coming' },
  { key: 'exercise', label: 'Exercise', hint: 'the build that proves it' },
];

function Reveal({ model, note }: { model: AnswerModel; note?: string }) {
  return (
    <Panel title="Answer model" aside={note ?? 'revision material now, spoiler never'}>
      <dl className="divide-y divide-line">
        {MODEL.map((entry) => (
          <div key={entry.key} className="py-2 first:pt-0 last:pb-0">
            <dt className="flex items-baseline gap-2 text-[11px] uppercase tracking-wide text-dim">
              {entry.label}
              <span className="normal-case tracking-normal text-dim/70">{entry.hint}</span>
            </dt>
            <dd className="mt-1 text-[12px] leading-relaxed text-muted">
              <Prose text={model[entry.key]} />
            </dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}

function LockedNotice({ error, topicSlug }: { error: ApiError; topicSlug: string }) {
  const details = error.details as { repairPath?: { slug: string; title: string; currentLevel: number }[] } | null;
  return (
    <Panel title="Refused" aside={error.code}>
      <p className="text-[13px] text-due">{error.message}</p>
      {details?.repairPath && details.repairPath.length > 0 && (
        <ul className="mt-2 space-y-1">
          {details.repairPath.map((step) => (
            <li key={step.slug} className="text-[11px] text-muted">
              <Link href={`/topics/${step.slug}`} className="text-accent hover:underline">
                {step.title}
              </Link>{' '}
              · at L{step.currentLevel}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex gap-3">
        <Link href="/progress" className="text-[12px] text-accent hover:underline">
          See what the ledger says is weak
        </Link>
        <Link href={`/topics/${topicSlug}`} className="text-[12px] text-muted hover:underline">
          topic detail
        </Link>
      </div>
    </Panel>
  );
}
