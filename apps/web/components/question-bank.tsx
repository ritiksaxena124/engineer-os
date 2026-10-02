'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge, Chip, Panel, inputClass } from '@/components/ui';
import { Empty, Failure, Loading } from '@/components/states';
import { useQuery } from '@/lib/useQuery';
import type { QuestionFacets, QuestionSummary, Topic } from '@/lib/types';

interface Browse {
  questions: QuestionSummary[];
  facets: QuestionFacets;
}

/**
 * Easy, Medium and Hard are the sheet names for rungs the API already stores as D1–D7, so a band
 * chip is a difficulty range wearing friendlier clothes rather than a second ladder.
 */
const BANDS = [
  { key: 'all', label: 'All', floor: 1, ceiling: 7 },
  { key: 'easy', label: 'Easy', floor: 1, ceiling: 3 },
  { key: 'medium', label: 'Medium', floor: 4, ceiling: 4 },
  { key: 'hard', label: 'Hard', floor: 5, ceiling: 7 },
] as const;

type BandKey = (typeof BANDS)[number]['key'];

// intensity climbs with the level, and no band borrows the red the mastery engine uses for a gap.
const bandTone = { Easy: 'neutral', Medium: 'accent', Hard: 'due' } as const;

const control = `${inputClass} w-auto shrink-0 py-1 text-[12px]`;

export function QuestionBank({
  bank,
  title,
  blurb,
}: {
  bank: 'dsa' | 'interview';
  title: string;
  blurb: string;
}) {
  const [band, setBand] = useState<BandKey>('all');
  const [area, setArea] = useState('all');
  const [company, setCompany] = useState('all');
  const [needle, setNeedle] = useState('');
  const [order, setOrder] = useState<'asc' | 'desc' | 'title'>('asc');

  const rung = BANDS.find((entry) => entry.key === band)!;
  const query = useQuery<Browse>(
    `questions?bank=${bank}&diagnostic=false` +
      `&minDifficulty=${rung.floor}&maxDifficulty=${rung.ceiling}` +
      (area === 'all' ? '' : `&topic=${area}`) +
      (company === 'all' ? '' : `&company=${company}`),
  );
  const topics = useQuery<{ topics: Topic[] }>('curriculum/topics');

  const error = query.error ?? topics.error;
  if (error) return <Failure error={error} onRetry={query.reload} />;
  if (query.loading || topics.loading || !query.data || !topics.data) return <Loading />;

  const unlocked = new Set(
    topics.data.topics.filter((topic) => topic.unlocked).map((topic) => topic.slug),
  );
  const countIn = (floor: number, ceiling: number) =>
    query.data!.facets.difficulties
      .filter((entry) => entry.difficulty >= floor && entry.difficulty <= ceiling)
      .reduce((total, entry) => total + entry.count, 0);

  const hunt = needle.trim().toLowerCase();
  const rows = query.data.questions
    .filter(
      (question) =>
        !hunt ||
        question.stem.toLowerCase().includes(hunt) ||
        question.topicSlug.toLowerCase().includes(hunt),
    )
    .sort((a, b) =>
      order === 'title'
        ? a.stem.localeCompare(b.stem)
        : order === 'asc'
          ? a.difficulty - b.difficulty || a.slug.localeCompare(b.slug)
          : b.difficulty - a.difficulty || a.slug.localeCompare(b.slug),
    );

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between gap-6 border-b border-line pb-4">
        <div>
          <h1 className="text-[20px] tracking-tight text-ink">{title}</h1>
          <p className="mt-1 max-w-[70ch] text-[12px] text-muted">{blurb}</p>
        </div>
        <input
          className={`${inputClass} w-64`}
          placeholder="filter by stem or topic"
          value={needle}
          onChange={(event) => setNeedle(event.target.value)}
        />
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-wide text-dim">level</span>
        {BANDS.map((entry) => (
          <Chip
            key={entry.key}
            active={band === entry.key}
            onClick={() => setBand(entry.key)}
          >
            {entry.label}{' '}
            <span className="numeric text-dim">
              {countIn(entry.floor, entry.ceiling)}
            </span>
          </Chip>
        ))}

        <span className="text-[11px] uppercase tracking-wide text-dim">area</span>
        <select
          className={control}
          aria-label="topic area"
          value={area}
          onChange={(event) => setArea(event.target.value)}
        >
          <option value="all">all areas</option>
          {query.data.facets.areas.map((entry) => (
            <option key={entry.slug} value={entry.slug}>
              {entry.title} ({entry.count})
            </option>
          ))}
        </select>

        <span className="text-[11px] uppercase tracking-wide text-dim">asked at</span>
        <Chip active={company === 'all'} onClick={() => setCompany('all')}>
          Any
        </Chip>
        {query.data.facets.companies
          .filter((entry) => entry.count > 0)
          .map((entry) => (
            <Chip
              key={entry.key}
              active={company === entry.key}
              onClick={() => setCompany(entry.key)}
            >
              {entry.label} <span className="numeric text-dim">{entry.count}</span>
            </Chip>
          ))}

        <select
          className={`${control} ml-auto`}
          aria-label="sort order"
          value={order}
          onChange={(event) => setOrder(event.target.value as typeof order)}
        >
          <option value="asc">easiest first</option>
          <option value="desc">hardest first</option>
          <option value="title">a–z</option>
        </select>
      </div>

      <Panel
        title="Problems"
        aside={`${rows.length} shown of ${query.data.questions.length} in this filter`}
      >
        {rows.length === 0 ? (
          <Empty title="Nothing matches that filter.">
            Clear the level, area or company, or widen the search to see the bank
            again.
          </Empty>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((question) => {
              const open = unlocked.has(question.topicSlug);
              return (
                <li
                  key={question.slug}
                  className="flex items-start justify-between gap-4 py-2 first:pt-0 last:pb-0"
                >
                  <span className="min-w-0">
                    {open ? (
                      <Link
                        href={`/practice/${question.slug}`}
                        className="text-[12px] text-ink hover:underline"
                      >
                        {question.stem}
                      </Link>
                    ) : (
                      <span className="text-[12px] text-dim">{question.stem}</span>
                    )}
                    <span className="mt-0.5 block truncate text-[11px] text-dim">
                      {question.topicSlug} · {question.category} ·{' '}
                      {question.conceptCount} concepts to touch
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    {(question.companies ?? []).map((tag) => (
                      <Badge key={tag.key} tone="neutral">
                        {tag.label}
                      </Badge>
                    ))}
                    <Badge
                      tone={
                        bandTone[(question.band ?? 'Medium') as keyof typeof bandTone] ?? 'neutral'
                      }
                    >
                      {question.band}
                    </Badge>
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
