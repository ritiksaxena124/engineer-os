'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui';
import { Empty, Failure, Loading } from '@/components/states';
import { RungLabel } from '@/components/rung';
import { useQuery } from '@/lib/useQuery';
import type { Phase, Topic } from '@/lib/types';

/**
 * The graph is 40 phases and 303 topics; a flat list of that is unusable. Only the work in front
 * of the learner is expanded — the phases behind are evidence of progress and the ones ahead are
 * a queue they can see but not skip into.
 */
export function LearningPath() {
  const phases = useQuery<{ phases: Phase[] }>('curriculum/phases');
  const topics = useQuery<{ topics: Topic[] }>('curriculum/topics');
  const error = phases.error ?? topics.error;

  if (error) return <Failure error={error} onRetry={phases.reload} />;
  if (phases.loading || topics.loading || !phases.data || !topics.data) return <Loading />;

  const byPhase = new Map<string, Topic[]>();
  for (const topic of topics.data.topics) {
    const rows = byPhase.get(topic.phaseKey);
    if (rows) rows.push(topic);
    else byPhase.set(topic.phaseKey, [topic]);
  }

  const ordered = phases.data.phases.map((phase) => ({
    phase,
    topics: (byPhase.get(phase.key) ?? []).slice().sort((a, b) => a.number - b.number),
  }));
  const frontier = ordered.findIndex((entry) => entry.topics.some((topic) => topic.unlocked));

  return (
    <div className="space-y-4">
      <PathHeader total={topics.data.topics.length} evidenced={topics.data.topics.filter((topic) => topic.level > 0).length} />
      {ordered.map((entry, index) => (
        <PhaseBlock
          key={entry.phase.key}
          phase={entry.phase}
          topics={entry.topics}
          state={index === frontier ? 'frontier' : index < frontier ? 'behind' : 'ahead'}
        />
      ))}
      {frontier === -1 && <Empty title="Every phase is gated." >Run the diagnostic to find which prerequisite is actually missing.</Empty>}
    </div>
  );
}

function PathHeader({ total, evidenced }: { total: number; evidenced: number }) {
  return (
    <header className="flex items-end justify-between border-b border-line pb-4">
      <div>
        <h1 className="text-[20px] tracking-tight text-ink">Learning path</h1>
        <p className="mt-1 text-[12px] text-muted">
          {evidenced} of {total} topics carry evidence. A topic unlocks when a critical prerequisite reaches L3.
        </p>
      </div>
    </header>
  );
}

function PhaseBlock({
  phase,
  topics,
  state,
}: {
  phase: Phase;
  topics: Topic[];
  state: 'frontier' | 'behind' | 'ahead';
}) {
  const [open, setOpen] = useState(state !== 'ahead');
  const unlocked = topics.filter((topic) => topic.unlocked).length;

  return (
    <section className="rounded-panel border border-line bg-surface">
      <button
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-baseline gap-3 px-4 py-3 text-left"
      >
        <span className="numeric w-8 shrink-0 text-[11px] text-dim">P{String(phase.number).padStart(2, '0')}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] text-ink">{phase.title}</span>
          {state !== 'frontier' && <span className="mt-0.5 block truncate text-[11px] text-dim">{phase.summary}</span>}
        </span>
        <Badge tone={state === 'behind' ? 'held' : state === 'frontier' ? 'accent' : 'neutral'}>
          {unlocked}/{topics.length} open
        </Badge>
        <span className="w-4 text-[11px] text-dim">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <ul className="border-t border-line">
          {topics.map((topic) => (
            <TopicRow key={topic.slug} topic={topic} />
          ))}
        </ul>
      )}
    </section>
  );
}

function TopicRow({ topic }: { topic: Topic }) {
  const blockers = useMemo(() => topic.blockedBy.slice(0, 2), [topic.blockedBy]);

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line px-4 py-2 last:border-b-0">
      {topic.unlocked ? (
        <Link href={`/topics/${topic.slug}`} className="text-[12px] text-ink hover:underline">
          {topic.title}
        </Link>
      ) : (
        <span className="text-[12px] text-dim">{topic.title}</span>
      )}
      <span className="truncate text-[11px] text-dim">{topic.slug}</span>
      <span className="ml-auto flex items-center gap-2">
        {topic.level > 0 ? (
          <RungLabel level={topic.level} />
        ) : topic.unlocked ? (
          <Badge tone="neutral">open · unanswered</Badge>
        ) : (
          <Badge tone="neutral">gated</Badge>
        )}
        {!topic.unlocked &&
          blockers.map((blocker) => (
            <Link
              key={blocker.slug}
              href={`/topics/${blocker.slug}`}
              title={`${blocker.slug} is at L${blocker.currentLevel}, this needs L${blocker.requiredLevel}`}
              className="text-[11px] text-due underline-offset-2 hover:underline"
            >
              {blocker.slug} L{blocker.currentLevel}
            </Link>
          ))}
      </span>
    </li>
  );
}
