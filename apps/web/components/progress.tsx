'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge, Panel } from '@/components/ui';
import { Empty, Failure, Loading } from '@/components/states';
import { Rung } from '@/components/rung';
import { useQuery } from '@/lib/useQuery';
import { PASS_SCORE, shortDate } from '@/lib/view';
import type { Review, Standing, Topic, Weakness } from '@/lib/types';

/**
 * Progress is the audit trail, so it shows the ledger rather than a percentage: which dimension
 * produced the standing, how many attempts it took, and when the recall of it expires.
 */
export function Progress() {
  const standings = useQuery<{ standings: Standing[]; summary: { topics: number; levels: Record<string, number> } }>('mastery');
  const reviews = useQuery<{ reviews: Review[] }>('mastery/reviews/due');
  const topics = useQuery<{ topics: Topic[] }>('curriculum/topics');
  const weaknesses = useQuery<{ weaknesses: Weakness[] }>('mastery/weaknesses');

  const error = standings.error ?? reviews.error ?? topics.error ?? weaknesses.error;
  if (error) return <Failure error={error} onRetry={standings.reload} />;
  if (standings.loading || !standings.data || !topics.data) return <Loading />;

  const titles = new Map(topics.data.topics.map((topic) => [topic.slug, topic.title]));

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between gap-6 border-b border-line pb-4">
        <div>
          <h1 className="text-[20px] tracking-tight text-ink">Progress</h1>
          <p className="mt-1 text-[12px] text-muted">
            Every rung below was computed from an answer, and every one of them can fall.
          </p>
        </div>
        <span className="flex flex-wrap justify-end gap-2">
          {Object.entries(standings.data.summary.levels).map(([key, count]) => (
            <Badge key={key} tone={key === 'exposure' ? 'neutral' : 'held'}>
              {key} ×{count}
            </Badge>
          ))}
        </span>
      </header>

      {weaknesses.data && weaknesses.data.weaknesses.length > 0 && (
        <Panel title="Open findings" aside="three misses in a row, walked back down the graph">
          <ul className="space-y-3">
            {weaknesses.data.weaknesses.map((entry) => (
              <li key={entry.topicSlug} className="border-l-2 border-weak pl-3">
                <Link href={`/topics/${entry.topicSlug}`} className="text-[12px] text-ink hover:underline">
                  {entry.title}
                </Link>
                <span className="ml-2 text-[11px] text-dim">
                  {entry.failedStreak} of {entry.attempts} latest attempts · {entry.lapses} review lapses
                </span>
                <p className="mt-1 text-[12px] leading-relaxed text-muted">{entry.action}</p>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Panel title="Standings" aside={`${standings.data.standings.length} topics with evidence`}>
        {standings.data.standings.length === 0 ? (
          <Empty title="Nothing evidenced." >An attempt is the only thing that writes here.</Empty>
        ) : (
          <ul className="divide-y divide-line">
            {standings.data.standings.map((standing) => (
              <StandingRow key={standing.topicSlug} standing={standing} title={titles.get(standing.topicSlug) ?? standing.topicSlug} />
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Recall queue" aside={reviews.data ? `${reviews.data.reviews.length} due` : undefined}>
        {!reviews.data || reviews.data.reviews.length === 0 ? (
          <Empty title="Nothing due." />
        ) : (
          <ul className="divide-y divide-line">
            {reviews.data.reviews.map((review) => {
              return (
                <li key={review.questionSlug} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
                  <Link href={`/practice/${review.questionSlug}`} className="min-w-0 text-[12px] text-ink hover:underline">
                    {review.questionSlug}
                  </Link>
                  <span className="flex shrink-0 items-center gap-3 text-[11px] text-dim">
                    <span>{review.topicSlug}</span>
                    <span>interval {review.intervalDays} d</span>
                    <span>due {shortDate(review.dueAt)}</span>
                    {review.lapseCount > 0 && <Badge tone="recall">lapsed ×{review.lapseCount}</Badge>}
                    <Badge tone="due">due now</Badge>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function StandingRow({ standing, title }: { standing: Standing; title: string }) {
  const [open, setOpen] = useState(false);
  const evidenced = standing.signals.filter((signal) => signal.evidenceCount > 0);

  return (
    <li className="py-2 first:pt-0 last:pb-0">
      <button onClick={() => setOpen((current) => !current)} className="flex w-full items-center gap-3 text-left">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] text-ink">{title}</span>
          <span className="block truncate text-[11px] text-dim">{standing.topicSlug}</span>
        </span>
        <span className="numeric text-[11px] text-dim">{evidenced.length}/8 dimensions</span>
        <Rung level={standing.level} levelKey={standing.levelKey} />
        <span className="w-4 text-[11px] text-dim">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <table className="mt-2 w-full text-[11px]">
          <thead className="text-dim">
            <tr>
              <th className="w-full pb-1 text-left font-normal">dimension</th>
              <th className="pb-1 text-right font-normal">rung</th>
              <th className="pb-1 text-right font-normal">weight</th>
              <th className="pb-1 text-right font-normal">evidence</th>
              <th className="pb-1 text-right font-normal">score</th>
            </tr>
          </thead>
          <tbody>
            {standing.signals.map((signal) => {
              const held = signal.evidenceCount > 0 && signal.score >= PASS_SCORE;
              return (
                <tr key={signal.key} className="border-t border-line">
                  <td className="py-1 text-muted">{signal.key}</td>
                  <td className="numeric py-1 text-right text-dim">L{signal.levelNumber}</td>
                  <td className="numeric py-1 text-right text-dim">{signal.weight}</td>
                  <td className="numeric py-1 text-right text-dim">×{signal.evidenceCount}</td>
                  <td className={`numeric py-1 text-right ${held ? 'text-held' : 'text-dim'}`}>{signal.score}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </li>
  );
}
