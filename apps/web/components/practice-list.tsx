'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge, Panel, inputClass } from '@/components/ui';
import { Empty, Failure, Loading } from '@/components/states';
import { useQuery } from '@/lib/useQuery';
import { difficultyLabel } from '@/lib/view';
import type { QuestionSummary, Topic } from '@/lib/types';

export function PracticeList() {
  const questions = useQuery<{ questions: QuestionSummary[] }>('questions?diagnostic=false');
  const topics = useQuery<{ topics: Topic[] }>('curriculum/topics');
  const [filter, setFilter] = useState('');

  const error = questions.error ?? topics.error;
  if (error) return <Failure error={error} onRetry={questions.reload} />;
  if (questions.loading || topics.loading || !questions.data || !topics.data) return <Loading />;

  const unlocked = new Set(topics.data.topics.filter((topic) => topic.unlocked).map((topic) => topic.slug));
  const needle = filter.trim().toLowerCase();
  const rows = questions.data.questions.filter(
    (question) =>
      !needle ||
      question.stem.toLowerCase().includes(needle) ||
      question.topicSlug.includes(needle) ||
      question.category.includes(needle),
  );

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between gap-6 border-b border-line pb-4">
        <div>
          <h1 className="text-[20px] tracking-tight text-ink">Practice</h1>
          <p className="mt-1 text-[12px] text-muted">
            The answer model is withheld until you have answered. That is the point of active recall.
          </p>
        </div>
        <input
          className={`${inputClass} w-64`}
          placeholder="filter by stem, topic or category"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        />
      </header>

      <Panel title="Drills" aside={`${rows.length} shown`}>
        {rows.length === 0 ? (
          <Empty title="Nothing matches that filter." />
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((question) => {
              const open = unlocked.has(question.topicSlug);
              return (
                <li key={question.slug} className="flex items-start justify-between gap-4 py-2 first:pt-0 last:pb-0">
                  <span className="min-w-0">
                    {open ? (
                      <Link href={`/practice/${question.slug}`} className="text-[12px] text-ink hover:underline">
                        {question.stem}
                      </Link>
                    ) : (
                      <span className="text-[12px] text-dim">{question.stem}</span>
                    )}
                    <span className="mt-0.5 block truncate text-[11px] text-dim">
                      {question.topicSlug} · {question.conceptCount} concepts to touch
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <Badge tone="neutral">{question.category}</Badge>
                    <span className="text-[11px] text-dim">{difficultyLabel(question)}</span>
                    {!open && <Badge tone="neutral">gated</Badge>}
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
