import type { ReactNode } from 'react';

/**
 * The sign-in screen is the first page of a mentor, so it states the contract instead of
 * decorating it: nothing here is awarded for reading.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.1fr_minmax(380px,0.9fr)]">
      <section className="hidden flex-col justify-between border-r border-line p-10 lg:flex">
        <header className="flex items-center gap-2 text-[13px] text-muted">
          <span className="inline-flex gap-[3px] items-end" aria-hidden>
            {[6, 9, 12, 15, 18, 21].map((height) => (
              <span key={height} style={{ height }} className="w-[3px] rounded-[1px] bg-line-strong" />
            ))}
          </span>
          EngineerOS
        </header>

        <div className="max-w-[52ch]">
          <h1 className="text-[28px] leading-tight tracking-tight text-ink">
            A senior engineer is a set of demonstrated abilities, not a number of years.
          </h1>
          <p className="mt-4 text-[13px] leading-relaxed text-muted">
            Forty phases, three hundred topics, one ladder per topic. You climb a rung by answering,
            not by reading — a lesson you have only read is exposure, and exposure unlocks nothing.
          </p>
          <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-4 text-[12px]">
            <div>
              <dt className="text-dim">Evidence</dt>
              <dd className="mt-1 text-ink">An attempt under 60 is not mastery, however many there are.</dd>
            </div>
            <div>
              <dt className="text-dim">Recall</dt>
              <dd className="mt-1 text-ink">Answers at 1, 3, 7, 14 and 30 days, or the standing falls.</dd>
            </div>
            <div>
              <dt className="text-dim">Failure</dt>
              <dd className="mt-1 text-ink">Three misses in a row sends you back down the graph.</dd>
            </div>
            <div>
              <dt className="text-dim">Depth</dt>
              <dd className="mt-1 text-ink">Name-dropping is graded as shallow. Explain the mechanism.</dd>
            </div>
          </dl>
        </div>

        <p className="text-[11px] text-dim">Local-first. Your attempts and standings stay in your database.</p>
      </section>

      <section className="flex items-center justify-center p-6">{children}</section>
    </main>
  );
}
