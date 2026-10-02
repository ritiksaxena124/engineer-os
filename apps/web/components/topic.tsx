'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Badge, Panel } from '@/components/ui';
import { Empty, Failure, Loading } from '@/components/states';
import { Rung } from '@/components/rung';
import { useQuery } from '@/lib/useQuery';
import { PASS_SCORE, difficultyLabel, shortDate } from '@/lib/view';
import type { LessonSummary, QuestionSummary, RepairStep, Standing, Topic } from '@/lib/types';

export function TopicScreen() {
  const { slug = '' } = useParams<{ slug: string }>();
  const topics = useQuery<{ topics: Topic[] }>('curriculum/topics');
  const lessons = useQuery<{ lessons: LessonSummary[] }>(`lessons?topic=${slug}`);
  const questions = useQuery<{ questions: QuestionSummary[] }>(`questions?topic=${slug}`);
  const standings = useQuery<{ standings: Standing[] }>('mastery');

  const topic = topics.data?.topics.find((entry) => entry.slug === slug);
  // parked until the graph answers, and never fetched at all once the topic is known to be open
  const repair = useQuery<{ slug: string; path: RepairStep[] }>(
    topic && !topic.unlocked ? `curriculum/topics/${slug}/repair-path` : null,
  );

  const error = topics.error ?? lessons.error ?? questions.error ?? standings.error;
  if (error) return <Failure error={error} onRetry={topics.reload} />;
  if (topics.loading || !topics.data) return <Loading />;

  if (!topic) return <Empty title={`No topic "${slug}" in the graph.`} />;

  const standing = standings.data?.standings.find((entry) => entry.topicSlug === slug);

  return (
    <div className="space-y-4">
      <header className="border-b border-line pb-4">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-dim">
              {topic.phaseKey} · {topic.skillKey ?? 'no skill key'}
            </p>
            <h1 className="mt-1 text-[20px] tracking-tight text-ink">{topic.title}</h1>
            <p className="mt-1 max-w-[70ch] text-[13px] leading-relaxed text-muted">{topic.summary}</p>
          </div>
          <div className="shrink-0 text-right">
            {standing ? <Rung level={standing.level} levelKey={standing.levelKey} /> : <Rung level={0} />}
            <p className="mt-1 text-[11px] text-dim">
              {standing ? `aggregate ${standing.score}/100` : 'no attempt on record'}
            </p>
          </div>
        </div>

        {!topic.unlocked && (
          <div className="mt-3 rounded-panel border border-due/40 bg-due/5 px-3 py-2">
            <p className="text-[12px] text-due">
              Gated. {topic.blockedBy.map((blocker) => `${blocker.slug} is at L${blocker.currentLevel}, needs L${blocker.requiredLevel}`).join('; ')}
            </p>
            {repair.data && repair.data.path.length > 0 && (
              <ul className="mt-2 space-y-1">
                {repair.data.path.map((step) => (
                  <li key={step.slug} className="text-[11px] text-muted">
                    <Link href={`/topics/${step.slug}`} className="text-accent hover:underline">
                      {step.title}
                    </Link>{' '}
                    · {step.slug} at L{step.currentLevel}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Lessons" aside="reading is exposure, never evidence">
          {!lessons.data || lessons.data.lessons.length === 0 ? (
            <Empty title="No lesson authored for this topic yet." />
          ) : (
            <ul className="divide-y divide-line">
              {lessons.data.lessons.map((lesson) => (
                <li key={lesson.slug} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
                  <Link href={`/lessons/${lesson.slug}`} className="min-w-0 text-[12px] text-ink hover:underline">
                    {lesson.title}
                  </Link>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="text-[11px] text-dim">{lesson.sectionCount} sections</span>
                    <Badge tone={lesson.readAt ? 'held' : 'neutral'}>
                      {lesson.readAt ? `read ${shortDate(lesson.readAt)}` : 'unread'}
                    </Badge>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Drills" aside="a rung is held by the most recent answer">
          {!questions.data || questions.data.questions.length === 0 ? (
            <Empty title="No drill authored for this topic yet." />
          ) : (
            <ul className="divide-y divide-line">
              {questions.data.questions.map((question) => (
                <li key={question.slug} className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
                  <Link href={`/practice/${question.slug}`} className="min-w-0 text-[12px] text-ink hover:underline">
                    {question.stem}
                  </Link>
                  <span className="flex shrink-0 items-center gap-2">
                    <Badge tone="neutral">{question.category}</Badge>
                    <span className="text-[11px] text-dim">{difficultyLabel(question)} · {question.levelKey}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Evidence dimensions" aside="eight signals, weighted; an unevidenced one counts as zero">
        {!standings.data || !standing ? (
          <Empty title="Nothing evidenced." >Answer a drill on this topic and the ledger starts.</Empty>
        ) : (
          <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {standing.signals.map((signal) => (
              <li key={signal.key} className="flex items-center justify-between gap-3">
                <span className="truncate text-[12px] text-muted">{signal.key}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="numeric text-[11px] text-dim">×{signal.evidenceCount}</span>
                  <span
                    className={`numeric w-8 text-right text-[12px] ${
                      signal.evidenceCount > 0 && signal.score >= PASS_SCORE ? 'text-held' : 'text-weak'
                    }`}
                  >
                    {signal.score}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
