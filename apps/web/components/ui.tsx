import type { ReactNode } from 'react';

const toneClass = {
  neutral: 'border-line-strong text-muted',
  held: 'border-held/40 text-held',
  due: 'border-due/40 text-due',
  weak: 'border-weak/40 text-weak',
  recall: 'border-recall/40 text-recall',
  accent: 'border-accent/40 text-accent',
} as const;

export type Tone = keyof typeof toneClass;

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-control border bg-surface px-1.5 py-0.5 text-[11px] leading-none ${toneClass[tone]}`}
    >
      {children}
    </span>
  );
}

export function Panel({
  title,
  aside,
  children,
  className = '',
}: {
  title?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-panel border border-line bg-surface ${className}`}>
      {title !== undefined && (
        <header className="flex items-baseline justify-between gap-4 border-b border-line px-4 py-3">
          <h2 className="text-[13px] font-medium tracking-tight text-ink">{title}</h2>
          {aside !== undefined && <div className="shrink-0 text-[11px] text-dim">{aside}</div>}
        </header>
      )}
      <div className="px-4 py-3">{children}</div>
    </section>
  );
}

export function Button({
  variant = 'primary',
  type = 'button',
  disabled,
  busy = false,
  children,
  onClick,
}: {
  variant?: 'primary' | 'ghost' | 'danger';
  type?: 'button' | 'submit';
  disabled?: boolean;
  busy?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  const variants = {
    primary: 'border-accent/50 bg-accent/15 text-accent hover:bg-accent/25',
    ghost: 'border-line-strong bg-transparent text-muted hover:border-line-strong hover:bg-raised hover:text-ink',
    danger: 'border-weak/40 bg-transparent text-weak hover:bg-weak/10',
  } as const;

  return (
    <button
      type={type}
      disabled={disabled || busy}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-control border px-3 py-1.5 text-[13px] transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${variants[variant]}`}
    >
      {busy && <span className="size-2 animate-pulse rounded-full border border-current" />}
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-wide text-dim">{label}</span>
      {children}
      {hint !== undefined && !error && <span className="mt-1 block text-[11px] text-dim">{hint}</span>}
      {error && <span className="mt-1 block text-[11px] text-weak">{error}</span>}
    </label>
  );
}

export const inputClass =
  'w-full rounded-control border border-line-strong bg-canvas px-2.5 py-1.5 text-[13px] text-ink placeholder:text-dim';

/** A filter that shows its own result count, so a chip never advertises a list the learner cannot reach. */
export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-control border px-2 py-1 text-[12px] transition-colors ${
        active
          ? 'border-accent/50 bg-accent/15 text-accent'
          : 'border-line-strong bg-transparent text-muted hover:bg-raised hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}
