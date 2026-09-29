import type { Tone } from '@/components/ui';
import { Badge } from '@/components/ui';
import { rungTone } from '@/lib/view';

const RUNGS = 8;

/**
 * The ladder is drawn, not described: eight ticks, and the learner can see how far the evidence
 * actually reaches instead of reading a percentage that hides which rung is missing.
 */
export function Rung({ level, levelKey }: { level: number; levelKey?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="flex items-end gap-[3px]" aria-hidden>
        {Array.from({ length: RUNGS }, (_, index) => {
          const held = index <= level;
          const height = 6 + index * 1.5;
          return (
            <span
              key={index}
              style={{ height }}
              className={`w-[3px] rounded-[1px] ${held ? 'bg-held' : 'bg-line-strong'}`}
            />
          );
        })}
      </span>
      <RungLabel level={level} levelKey={levelKey} />
    </span>
  );
}

export function RungLabel({ level, levelKey }: { level: number; levelKey?: string }) {
  const tone: Tone = rungTone(level);
  const text = levelKey ? `L${level} · ${levelKey}` : `L${level}`;
  return <Badge tone={tone}>{text}</Badge>;
}
