import type { ReactNode } from 'react';

/**
 * Content authors code with ``` fences and inline `spans`, so the screens that show a question or
 * an answer model render those markers instead of printing them. Nothing here guesses that a
 * paragraph is code: it has to be fenced to be rendered that way.
 */
const FENCE = /```[ \t]*([a-z]+)?[ \t]*\r?\n([\s\S]*?)```[ \t]*/gi;

export function Prose({ text, className = '' }: { text: string; className?: string }) {
  const blocks: ReactNode[] = [];
  let cursor = 0;
  for (const match of text.matchAll(FENCE)) {
    const start = match.index ?? 0;
    if (start > cursor) blocks.push(paragraph(text.slice(cursor, start), `t${start}`));
    blocks.push(
      <pre
        key={`c${start}`}
        className="overflow-x-auto rounded-control border border-line bg-canvas px-3 py-2.5 font-mono text-[11.5px] leading-relaxed text-ink"
      >
        {match[2].replace(/\s+$/, '')}
      </pre>,
    );
    cursor = start + match[0].length;
  }
  if (cursor < text.length) blocks.push(paragraph(text.slice(cursor), 'tail'));

  return <div className={`space-y-2 ${className}`}>{blocks}</div>;
}

function paragraph(text: string, key: string) {
  const trimmed = text.replace(/^\s*\n+|\n+\s*$/g, '');
  if (!trimmed) return <span key={key} />;
  return (
    <p key={key} className="max-w-[78ch] whitespace-pre-line">
      {inlineCode(trimmed)}
    </p>
  );
}

function inlineCode(text: string): ReactNode {
  const parts = text.split(/`([^`\n]+)`/g);
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <code key={index} className="rounded-[3px] bg-line px-1 py-0.5 font-mono text-[11px] text-ink">
        {part}
      </code>
    ) : (
      part
    ),
  );
}
