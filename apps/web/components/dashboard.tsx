'use client';

import Link from 'next/link';
import { Badge, Panel } from '@/components/ui';
import { Empty, Failure, Loading } from '@/components/states';
import { RungLabel } from '@/components/rung';
import { useQuery } from '@/lib/useQuery';
import { shortDate } from '@/lib/view';
import type { Phase, Review, Standing, Topic, Weakness } from '@/lib/types';

export function Dashboard() {
  const weaknesses = useQuery<{ threshold: number; weaknesses: Weakness[]; summary: { topics: number } }>(
    'mastery/weaknesses',
  );
  const reviews = useQuery<{ reviews: Review[] }>('mastery/reviews/due');
  const standings = useQuery<{ standings: Standing[]; summary: { topics: number; levels: Record<string, number> } }>('mastery');
  const topics = useQuery<{ topics: Topic[] }>('curriculum/topics');
  const phases = useQuery<{ phases: Phase[] }>('curriculum/phases');

  const loading = weaknesses.loading || reviews.loading || standings.loading || topics.loading;
  const error = weaknesses.error ?? reviews.error ?? standings.error ?? topics.error;

  if (error) return <Failure error={error} onRetry={weaknesses.reload} />;
  if (loading || !topics.data || !standings.data || !weaknesses.data || !reviews.data) return <Loading />;

  const evidenced = standings.data.standings;
  const levelOf = new Map(evidenced.map((row) => [row.topicSlug, row.level]));
  const next = topics.data.topics
    .filter((topic) => topic.unlocked && (levelOf.get(topic.slug) ?? 0) === 0)
    .slice(0, 6);
  const reached = topics.data.topics.filter((topic) => (levelOf.get(topic.slug) ?? 0) > 0).length;

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between border-b border-line pb-4">
        <div>
          <h1 className="text-[20px] tracking-tight text-ink">Where you are</h1>
          <p className="mt-1 text-[12px] text-muted">
            {evidenced.length === 0
              ? 'Nothing has been evidenced yet. The diagnostic decides where the work starts.'
              : `${evidenced.length} topic${evidenced.length === 1 ? '' : 's'} evidenced, ${reached} above exposure.`}
          </p>
        </div>
        <div className="flex gap-4 text-[11px] text-dim">
          <span>{phases.data?.phases.length ?? '—'} phases</span>
          <span>{topics.data.topics.length} topics</span>
        </div>
      </header>

      {evidenced.length === 0 && (
        <Panel title="Start here">
          <p className="text-[13px] text-muted">
            Thirty questions, no score, no promotion. It reads which parts of the graph are folklore and
            which are held, and it is the only thing you can sit before anything is unlocked.
          </p>
          <Link
            href="/diagnostic"
            className="mt-3 inline-block rounded-control border border-accent/50 bg-accent/15 px-3 py-1.5 text-[13px] text-accent hover:bg-accent/25"
          >
            Run the diagnostic
          </Link>
        </Panel>
      )}

      <Panel title="What needs attention" aside={`${weaknesses.data.threshold} misses in a row opens a finding`}>
        {weaknesses.data.weaknesses.length === 0 ? (
          <Empty title="No open findings." >
            Nothing has been missed three times in a row. Keep the reviews current instead.
          </Empty>
        ) : (
          <ul className="space-y-3">
            {weaknesses.data.weaknesses.map((entry) => (
              <li key={entry.topicSlug} className="border-l-2 border-weak pl-3">
                <div className="flex items-baseline gap-2">
                  <Link href={`/topics/${entry.topicSlug}`} className="text-[13px] text-ink hover:underline">
                    {entry.title}
                  </Link>
                  <Badge tone="weak">{entry.failedStreak} misses</Badge>
                  <span className="text-[11px] text-dim">
                    {entry.attempts} attempts · {entry.lapses} lapses
                  </span>
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-muted">{entry.action}</p>
                <p className="mt-1 text-[11px] text-dim">
                  Repair: <Link href={`/topics/${entry.rootCause.slug}`} className="text-accent hover:underline">{entry.rootCause.slug}</Link>{' '}
                  is at L{entry.rootCause.currentLevel}, needs L{entry.requiredLevel}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Reviews due" aside={reviews.data ? `${reviews.data.reviews.length} queued` : undefined}>
          {reviews.data.reviews.length === 0 ? (
            <Empty title="Nothing is due today." >
              Recall is scheduled at 1, 3, 7, 14 and 30 days. A standing you cannot reproduce falls.
            </Empty>
          ) : (
            <ul className="divide-y divide-line">
              {reviews.data.reviews.map((review) => (
                  <li key={review.questionSlug} className="flex items-center justify-between gap-3 py-2 first:pt-0">
                    <Link href={`/practice/${review.questionSlug}`} className="truncate text-[12px] text-ink hover:underline">
                      {review.questionSlug}
                    </Link>
                    <span className="flex shrink-0 items-center gap-2">
                      {review.lapseCount > 0 && <Badge tone="recall">lapsed ×{review.lapseCount}</Badge>}
                      <Badge tone="due">D{review.difficulty} · due {shortDate(review.dueAt)}</Badge>
                    </span>
                  </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Next unlocked, not yet evidenced">
          {next.length === 0 ? (
            <Empty title="Nothing waiting." >Either the graph is gated above you, or you have answered for everything you can reach.</Empty>
          ) : (
            <ul className="divide-y divide-line">
              {next.map((topic) => (
                <li key={topic.slug} className="flex items-center justify-between gap-3 py-2 first:pt-0">
                  <Link href={`/topics/${topic.slug}`} className="min-w-0 hover:underline">
                    <span className="block truncate text-[12px] text-ink">{topic.title}</span>
                    <span className="block truncate text-[11px] text-dim">{topic.slug}</span>
                  </Link>
                  <RungLabel level={topic.level} levelKey="exposure" />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Evidenced topics" aside="derived from the signal ledger, never asserted">
        {evidenced.length === 0 ? (
          <Empty title="No topic has an attempt yet." />
        ) : (
          <ul className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
            {evidenced
              .slice()
              .sort((a, b) => b.level - a.level || a.topicSlug.localeCompare(b.topicSlug))
              .map((row) => (
                <li key={row.topicSlug} className="flex items-center justify-between gap-2 py-1">
                  <Link href={`/topics/${row.topicSlug}`} className="truncate text-[12px] text-muted hover:text-ink hover:underline">
                    {row.topicSlug}
                  </Link>
                  <RungLabel level={row.level} levelKey={row.levelKey} />
                </li>
              ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
