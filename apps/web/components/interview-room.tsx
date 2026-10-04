'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import type { ReactNode } from 'react';
import toast from 'react-hot-toast';
import { Badge, Button, Panel } from '@/components/ui';
import { Failure, Loading } from '@/components/states';
import { api, ApiError } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import type { InterviewRoom, PromptResult, RunReport } from '@/lib/types';

/**
 * The candidate's room: the project on the left, the ticket in the middle, the prompt on the right.
 * Nothing here trusts the clock in the browser — the control plane re-checks the window on every
 * call, so this screen only renders the phase it was handed.
 */
export function InterviewRoom() {
  const { token } = useParams<{ token: string }>();
  const path = `interview/room/${token}`;
  const room = useQuery<InterviewRoom>(path);
  const [selected, setSelected] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [report, setReport] = useState<RunReport | null>(null);
  const [answer, setAnswer] = useState<PromptResult | null>(null);
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState<'save' | 'run' | 'prompt' | null>(null);
  const [refusal, setRefusal] = useState<ApiError | null>(null);

  const files = room.data?.files ?? [];
  const current = files.find((file) => file.path === selected) ?? files.find((file) => !file.isCheck) ?? files[0];
  const dirty = useMemo(
    () => files.filter((file) => drafts[file.path] !== undefined && drafts[file.path] !== file.contents),
    [files, drafts],
  );

  // The window is a deadline, not a suggestion: re-read it so a room that closes mid-task says so.
  useEffect(() => {
    if (!room.data || room.data.phase !== 'live') return;
    const timer = setInterval(() => room.reload(), 60_000);
    return () => clearInterval(timer);
  }, [room.data?.phase]);

  if (room.error) return <Failure error={room.error} onRetry={room.reload} />;
  if (room.loading && !room.data) return <Loading label="opening the room" />;
  if (!room.data) return null;

  const view = room.data;
  if (view.phase === 'locked') {
    return (
      <Shell title="Interview room" subtitle="not open yet">
        <Panel title="This room opens on a schedule" aside={view.candidateLabel}>
          <p className="text-[13px] leading-relaxed text-muted">
            The project, the ticket and the checks are held until{' '}
            <span className="numeric text-ink">{formatTime(view.scheduledAt)}</span> — about{' '}
            <span className="numeric text-ink">{view.minutesRemaining}</span> minutes away. The link you were given is
            the only thing needed then; there is nothing to prepare and nothing to read early.
          </p>
        </Panel>
      </Shell>
    );
  }
  if (view.phase === 'expired') {
    return (
      <Shell title="Interview room" subtitle="closed">
        <Panel title="This room has closed" aside={view.candidateLabel}>
          <p className="text-[13px] leading-relaxed text-muted">
            {view.ranOut
              ? 'The window ran out. Anything you saved is with the interviewer already.'
              : `The interviewer closed this room at ${formatTime(view.endedAt)}.`}
          </p>
        </Panel>
      </Shell>
    );
  }

  const draft = current ? (drafts[current.path] ?? current.contents) : '';

  async function save() {
    setBusy('save');
    setRefusal(null);
    try {
      const next = await api.post<InterviewRoom>(
        `interview/room/${token}/save`,
        { files: dirty.map((file) => ({ path: file.path, contents: drafts[file.path] })) },
      );
      setDrafts({});
      room.setData(next);
      toast.success(`${dirty.length} file${dirty.length === 1 ? '' : 's'} saved`);
    } catch (cause) {
      setRefusal(cause as ApiError);
    } finally {
      setBusy(null);
    }
  }

  async function run() {
    setBusy('run');
    setRefusal(null);
    try {
      setReport(await api.post<RunReport>(`interview/room/${token}/run`));
    } catch (cause) {
      setRefusal(cause as ApiError);
    } finally {
      setBusy(null);
    }
  }

  async function send() {
    if (prompt.trim().length === 0) return;
    setBusy('prompt');
    setRefusal(null);
    try {
      const result = await api.post<PromptResult>(`interview/room/${token}/prompt`, { prompt });
      setAnswer(result);
      setReport(result.report);
      room.setData(result.room);
      setDrafts({});
    } catch (cause) {
      setRefusal(cause as ApiError);
    } finally {
      setBusy(null);
    }
  }

  return (
    <Shell
      title={view.scenario?.title ?? 'Interview room'}
      subtitle={view.scenario?.roleKey}
      actions={
        <span className="flex items-center gap-2">
          <Badge tone={view.minutesRemaining && view.minutesRemaining <= 5 ? 'weak' : 'neutral'}>
            <span className="numeric">{view.minutesRemaining}</span> min left
          </Badge>
          {view.openedLate && <Badge tone="due">opened late</Badge>}
        </span>
      }
    >
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3">
        <Panel
          title="Project"
          aside={dirty.length > 0 ? `${dirty.length} unsaved` : `${files.length} files`}
          className="min-w-0"
        >
          <div className="flex flex-wrap gap-1">
            {files.map((file) => (
              <button
                key={file.path}
                onClick={() => setSelected(file.path)}
                className={`rounded-control border px-2 py-1 font-mono text-[11px] transition-colors ${
                  current?.path === file.path
                    ? 'border-accent/50 bg-accent/15 text-accent'
                    : 'border-line-strong text-muted hover:bg-raised hover:text-ink'
                }`}
              >
                {file.path}
                {file.isCheck && <span className="ml-1 text-dim">check</span>}
              </button>
            ))}
          </div>

          {current && (
            <>
              <textarea
                spellCheck={false}
                readOnly={current.isCheck}
                value={draft}
                onChange={(event) => setDrafts({ ...drafts, [current.path]: event.target.value })}
                className="mt-3 h-[46vh] w-full resize-y rounded-control border border-line-strong bg-canvas px-3 py-2.5 font-mono text-[11.5px] leading-relaxed text-ink"
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-[11px] text-dim">
                  {current.isCheck
                    ? 'Read-only: the checks are the acceptance criteria, not part of the fix.'
                    : 'Edit here, then save. The checks run against what you saved.'}
                </p>
                <Button variant="ghost" busy={busy === 'save'} disabled={dirty.length === 0} onClick={save}>
                  Save
                </Button>
              </div>
            </>
          )}
        </Panel>

        <div className="min-w-0 space-y-4">
          <Panel title="Ticket" aside={view.scenario?.ticketTitle}>
            <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-muted">{view.scenario?.ticketBody}</p>
          </Panel>

          <Panel
            title="Checks"
            aside={report ? `${report.summary.passed} passed · ${report.summary.failed} failed` : 'not run yet'}
          >
            {!report && (
              <p className="text-[12px] text-dim">
                Run the checks to see where the code stands. A green run is what the ticket is asking for.
              </p>
            )}
            {report?.crashed && <p className="text-[12px] text-weak">the sandbox stopped: {report.crashed}</p>}
            {report && (
              <ul className="divide-y divide-line">
                {report.results.map((result) => (
                  <li key={result.name} className="py-2 first:pt-0 last:pb-0">
                    <div className="flex items-baseline gap-2">
                      <Badge tone={result.passed ? 'held' : 'weak'}>{result.passed ? 'pass' : 'fail'}</Badge>
                      <span className="text-[12px] text-ink">{result.name}</span>
                    </div>
                    {!result.passed && <p className="mt-1 text-[11px] text-muted">{result.message}</p>}
                  </li>
                ))}
              </ul>
            )}
            {report && report.logs.length > 0 && (
              <pre className="mt-3 overflow-x-auto rounded-control border border-line bg-canvas px-3 py-2 font-mono text-[11px] text-muted">
                {report.logs.join('\n')}
              </pre>
            )}
            <div className="mt-3">
              <Button busy={busy === 'run'} onClick={run}>
                Run the checks
              </Button>
            </div>
          </Panel>
        </div>

        <Panel title="Ask the room to fix it" className="min-w-0">
          <p className="text-[12px] leading-relaxed text-dim">
            Describe the change the way you would brief another engineer: name the mechanism that broke and the one
            that should replace it. A clear brief gets the patch applied to your files; a vague one comes back with
            what is missing.
          </p>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            maxLength={4000}
            placeholder="the cached status goes stale because nothing invalidates it on the write path…"
            className="mt-3 h-40 w-full resize-y rounded-control border border-line-strong bg-canvas px-3 py-2.5 text-[13px] leading-relaxed text-ink placeholder:text-dim"
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="numeric text-[11px] text-dim">{prompt.trim().length} characters</span>
            <Button busy={busy === 'prompt'} disabled={prompt.trim().length === 0} onClick={send}>
              Send
            </Button>
          </div>

          {refusal && (
            <p className="mt-3 text-[12px] text-weak">
              {refusal.code === 'ROOM_CLOSED' ? 'this room closed while you were writing.' : refusal.message}
            </p>
          )}

          {answer && answer.applied.length === 0 && answer.declined.length > 0 && (
            <div className="mt-4 rounded-panel border border-due/40 bg-raised px-3 py-2.5">
              <p className="text-[12px] text-ink">Nothing was changed. The room could not see:</p>
              <ul className="mt-1 space-y-1">
                {answer.declined.map((entry) => (
                  <li key={entry.filePath} className="font-mono text-[11px] text-muted">
                    {entry.filePath}: {entry.missing.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {answer && answer.applied.map((fix) => (
            <article key={fix.filePath} className="mt-4 rounded-panel border border-held/40 bg-raised">
              <header className="flex items-baseline justify-between gap-3 border-b border-line px-3 py-2">
                <span className="font-mono text-[11px] text-ink">{fix.filePath}</span>
                <span className="numeric text-[11px] text-dim">
                  +{fix.stats.added} −{fix.stats.removed}
                </span>
              </header>
              <p className="px-3 py-2 text-[12px] leading-relaxed text-muted">{fix.rationale}</p>
              <Diff lines={fix.diff} />
            </article>
          ))}
        </Panel>
      </div>
    </Shell>
  );
}

function Diff({ lines }: { lines: { sign: ' ' | '-' | '+'; text: string }[] }) {
  return (
    <pre className="overflow-x-auto border-t border-line bg-canvas px-3 py-2 font-mono text-[11px] leading-relaxed">
      {lines.map((line, index) => (
        <span
          key={index}
          className={
            line.sign === '+'
              ? 'block text-held'
              : line.sign === '-'
                ? 'block text-weak'
                : 'block text-dim'
          }
        >
          {line.sign}
          {line.text}
        </span>
      ))}
    </pre>
  );
}

function Shell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-[1500px] px-6 py-6">
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-4 border-b border-line pb-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-dim">interview room</p>
          <h1 className="mt-1 text-[20px] tracking-tight text-ink">
            {title} {subtitle && <span className="text-muted">· {subtitle}</span>}
          </h1>
        </div>
        {actions}
      </header>
      {children}
    </main>
  );
}

function formatTime(value?: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}
