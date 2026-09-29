'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Badge, Button, Panel } from '@/components/ui';
import { Failure, Loading, Empty } from '@/components/states';
import { useQuery } from '@/lib/useQuery';
import { shortDate } from '@/lib/view';
import { api } from '@/lib/api';
import type { Lesson } from '@/lib/types';

/**
 * §43 anatomy is the page: the sections arrive in a fixed order and each one is labelled with the
 * job it does. The "read this" button is deliberately honest — it records exposure and buys no
 * mastery, and the page says so next to the button.
 */
export function LessonScreen() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [busy, setBusy] = useState(false);
  const lesson = useQuery<{ lesson: Lesson }>(`lessons/${slug}`);

  if (lesson.error) return <Failure error={lesson.error} onRetry={lesson.reload} />;
  if (lesson.loading || !lesson.data) return <Loading label="opening the lesson" />;

  const { lesson: page } = lesson.data;

  async function markRead() {
    setBusy(true);
    try {
      await api.post(`lessons/${slug}/read`);
      toast('Exposure recorded. The rung comes from an answer, not from this.', { icon: '◦' });
      lesson.reload();
    } catch (cause) {
      toast.error((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <header className="border-b border-line pb-4">
        <p className="text-[11px] uppercase tracking-wide text-dim">
          <Link href={`/topics/${page.topicSlug}`} className="hover:text-ink hover:underline">
            {page.topicSlug}
          </Link>
          {' '}· lesson
        </p>
        <div className="mt-1 flex items-start justify-between gap-6">
          <h1 className="text-[20px] tracking-tight text-ink">{page.title}</h1>
          <span className="flex shrink-0 items-center gap-3">
            <Badge tone={page.readAt ? 'held' : 'neutral'}>
              {page.readAt ? `read ${shortDate(page.readAt)}` : 'not read'}
            </Badge>
            <Button variant="ghost" busy={busy} onClick={markRead}>
              Mark as read
            </Button>
          </span>
        </div>
      </header>

      <div className="space-y-3">
        {page.sections.map((section) => (
          <Panel
            key={section.position}
            title={
              <span className="flex items-baseline gap-2">
                {section.label}
                <span className="text-[11px] font-normal text-dim">{section.guidance}</span>
              </span>
            }
          >
            <Prose body={section.body} />
          </Panel>
        ))}
        {page.sections.length === 0 && <Empty title="This lesson has no sections authored yet." />}
      </div>

      <Panel title="Then answer" aside="reading changes nothing on the ladder">
        <p className="text-[12px] text-muted">
          The drill for this topic is what evidences a rung. Go answer it, and come back here when the
          feedback names something you did not know.
        </p>
        <div className="mt-3">
          <Link href={`/topics/${page.topicSlug}`} className="text-[12px] text-accent hover:underline">
            Drills on {page.topicSlug}
          </Link>
        </div>
      </Panel>
    </div>
  );
}

/** Lesson bodies are authored as plain text with line breaks and inline `code`. */
function Prose({ body }: { body: string }) {
  return (
    <div className="max-w-[74ch] space-y-2 text-[13px] leading-relaxed text-muted">
      {body.split('\n').map((line, index) => (
        <p key={index}>{renderInline(line)}</p>
      ))}
    </div>
  );
}

function renderInline(line: string) {
  const parts = line.split(/(`[^`]+`)/g);
  return parts.map((part, index) =>
    part.startsWith('`') && part.endsWith('`') ? (
      <code key={index} className="rounded-[3px] bg-raised px-1 py-0.5 text-[12px] text-ink">
        {part.slice(1, -1)}
      </code>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}
