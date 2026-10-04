'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Badge, Button, Field, Panel, inputClass } from '@/components/ui';
import { Empty, Failure, Loading } from '@/components/states';
import { api } from '@/lib/api';
import { useQuery } from '@/lib/useQuery';
import type { InterviewRoom, RunReport } from '@/lib/types';

interface ScenarioRow {
  slug: string;
  title: string;
  roleKey: string;
  ticketTitle: string;
  _count: { files: number; fixes: number };
}

interface RoomSummary {
  id: string;
  scenarioSlug: string;
  scenarioTitle: string;
  candidateLabel: string;
  scheduledAt: string;
  closesAt: string;
  openMinutes: number;
  openedAt: string | null;
  endedAt: string | null;
  events: number;
  phase: 'locked' | 'live' | 'expired';
  minutesRemaining: number;
}

interface RoomDetail extends InterviewRoom {
  signalNotes: string;
  checks: string[];
  fixes: { filePath: string; requiredText: string; rationale: string; applied: boolean }[];
  events: { id: string; kindKey: string; input: string; outcome: RunReport | Record<string, unknown>; createdAt: string }[];
}

const phaseTone = { locked: 'neutral', live: 'held', expired: 'weak' } as const;

const plural = (n: number, word: string) => `${n} ${n === 1 ? word : word + 's'}`;

/** The link is shown once, by design: the control plane stores only its hash, so a list cannot re-issue it. */
const linkKey = (roomId: string) => `eos.roomLink.${roomId}`;

export function InterviewRooms() {
  const scenarios = useQuery<ScenarioRow[]>('interview/scenarios');
  const rooms = useQuery<RoomSummary[]>('interview/rooms');
  const [chosen, setChosen] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const scenario = scenarios.data?.find((entry) => entry.slug === chosen) ?? scenarios.data?.[0] ?? null;
  const detail = useQuery<RoomDetail>(selected ? `interview/rooms/${selected}` : null);

  async function refresh() {
    rooms.reload();
    detail.reload();
  }

  if (scenarios.error) return <Failure error={scenarios.error} onRetry={scenarios.reload} />;
  if (rooms.error) return <Failure error={rooms.error} onRetry={rooms.reload} />;
  if (scenarios.loading || rooms.loading) return <Loading label="reading the interview desk" />;

  return (
    <div className="space-y-4">
      <header className="border-b border-line pb-4">
        <p className="text-[11px] uppercase tracking-wide text-dim">interviews</p>
        <h1 className="mt-1 text-[20px] tracking-tight text-ink">Interview rooms</h1>
        <p className="mt-1 max-w-[74ch] text-[13px] leading-relaxed text-muted">
          A room is a buggy project, the ticket that describes the symptom and a prompt box, opened at a scheduled
          minute by a link only the candidate holds. What they type, save and run is written to a ledger you read
          afterwards — the judgement itself is a later phase.
        </p>
      </header>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <Schedule
          scenarios={scenarios.data ?? []}
          scenario={scenario?.slug ?? null}
          onPick={setChosen}
          onCreated={(room) => {
            rooms.reload();
            setSelected(room.id);
          }}
        />

        <Panel title="Rooms" aside={`${rooms.data?.length ?? 0} scheduled`}>
          {!rooms.data || rooms.data.length === 0 ? (
            <p className="text-[12px] text-dim">Nothing scheduled yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {rooms.data.map((room) => (
                <li key={room.id}>
                  <button
                    onClick={() => setSelected(room.id)}
                    className={`flex w-full flex-wrap items-baseline gap-x-3 gap-y-1 py-2.5 text-left transition-colors hover:bg-raised ${
                      selected === room.id ? 'bg-raised' : ''
                    }`}
                  >
                    <Badge tone={phaseTone[room.phase]}>{room.phase}</Badge>
                    <span className="min-w-0 flex-1 truncate text-[12px] text-ink">{room.candidateLabel}</span>
                    <span className="text-[11px] text-dim">{room.scenarioTitle}</span>
                    <span className="numeric text-[11px] text-dim">
                      {formatTime(room.scheduledAt)} · {plural(room.events, 'event')}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {selected && (
        <RoomEvidence
          detail={detail}
          link={readLink(selected)}
          onClosed={refresh}
        />
      )}
    </div>
  );
}

function Schedule({
  scenarios,
  scenario,
  onPick,
  onCreated,
}: {
  scenarios: ScenarioRow[];
  scenario: string | null;
  onPick: (slug: string) => void;
  onCreated: (room: { id: string }) => void;
}) {
  const [label, setLabel] = useState('');
  const [at, setAt] = useState('');
  const [minutes, setMinutes] = useState('60');
  const [busy, setBusy] = useState(false);
  const [issued, setIssued] = useState<{ id: string; url: string } | null>(null);

  const chosenScenario = scenarios.find((entry) => entry.slug === scenario) ?? null;
  const ready = Boolean(chosenScenario && label.trim() && at);

  async function create(event: FormEvent) {
    event.preventDefault();
    if (!chosenScenario || !ready) return;
    setBusy(true);
    try {
      const created = await api.post<{ shareToken: string; room: { id: string } }>('interview/rooms', {
        scenarioSlug: chosenScenario.slug,
        candidateLabel: label.trim(),
        scheduledAt: new Date(at).toISOString(),
        openMinutes: Number(minutes),
      });
      const url = `${window.location.origin}/i/${created.shareToken}`;
      window.localStorage.setItem(linkKey(created.room.id), url);
      setIssued({ id: created.room.id, url });
      setLabel('');
      setAt('');
      onCreated(created.room);
      toast.success('room scheduled');
    } catch (cause) {
      toast.error((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel title="Schedule a room" aside={chosenScenario?.ticketTitle}>
      <form onSubmit={create} className="space-y-3">
        <Field label="Scenario">
          <select
            className={inputClass}
            value={scenario ?? ''}
            onChange={(event) => onPick(event.target.value)}
          >
            {scenarios.map((entry) => (
              <option key={entry.slug} value={entry.slug}>
                {entry.title} · {entry.roleKey} · {entry._count.files} files
              </option>
            ))}
          </select>
        </Field>
        <Field label="Candidate" hint="a label for your own records — the candidate needs no account">
          <input className={inputClass} value={label} maxLength={120} onChange={(event) => setLabel(event.target.value)} placeholder="Ada L." />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Opens at">
            <input type="datetime-local" className={inputClass} value={at} onChange={(event) => setAt(event.target.value)} />
          </Field>
          <Field label="Window">
            <select className={inputClass} value={minutes} onChange={(event) => setMinutes(event.target.value)}>
              {[30, 45, 60, 90, 120].map((option) => (
                <option key={option} value={option}>
                  {option} minutes
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Button type="submit" busy={busy} disabled={!ready}>
          Schedule and issue the link
        </Button>
      </form>

      {issued && (
        <div className="mt-4 rounded-panel border border-held/40 bg-raised px-3 py-2.5">
          <p className="text-[12px] text-ink">Share this once. The control plane keeps only its hash.</p>
          <div className="mt-2 flex items-center gap-2">
            <input readOnly className={`${inputClass} font-mono text-[11px]`} value={issued.url} onFocus={(e) => e.target.select()} />
            <Button
              variant="ghost"
              onClick={() => {
                void navigator.clipboard.writeText(issued.url);
                toast.success('link copied');
              }}
            >
              Copy
            </Button>
          </div>
        </div>
      )}
    </Panel>
  );
}

function RoomEvidence({
  detail,
  link,
  onClosed,
}: {
  detail: ReturnType<typeof useQuery<RoomDetail>>;
  link: string | null;
  onClosed: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const room = detail.data;

  async function close() {
    if (!room?.id) return;
    setBusy(true);
    try {
      await api.post(`interview/rooms/${room.id}/close`);
      toast.success('room closed');
      onClosed();
    } catch (cause) {
      toast.error((cause as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (detail.error) return <Failure error={detail.error} onRetry={detail.reload} />;
  if (detail.loading && !room) return <Loading label="reading the room" />;
  if (!room) return <Empty title="No room selected." />;

  const prompts = room.events.filter((event) => event.kindKey === 'prompt');

  return (
    <div className="space-y-4">
      <Panel
        title={`${room.candidateLabel} · ${room.scenario?.title ?? ''}`}
        aside={
          room.minutesRemaining
            ? room.phase === 'locked'
              ? `opens in ${room.minutesRemaining} min`
              : `${room.minutesRemaining} min left`
            : undefined
        }
      >
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-dim">
          <Badge tone={phaseTone[room.phase]}>{room.phase}</Badge>
          <span>opened {room.openedAt ? formatTime(room.openedAt) : 'not yet'}</span>
          {room.openedLate && <Badge tone="due">opened late</Badge>}
          {room.endedAt && <span>closed {formatTime(room.endedAt)}</span>}
          {link && (
            <a href={link} target="_blank" rel="noreferrer" className="text-accent hover:underline">
              open as candidate
            </a>
          )}
          {!room.endedAt && (
            <Button variant="danger" busy={busy} onClick={close}>
              Close now
            </Button>
          )}
        </div>
        <p className="mt-3 max-w-[80ch] text-[12px] leading-relaxed text-muted">
          <span className="text-ink">What this room is for: </span>
          {room.signalNotes}
        </p>
      </Panel>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <Panel title="Ledger" aside={`${plural(room.events.length, 'entry')}`}>
          <ul className="divide-y divide-line">
            {room.events.map((event) => (
              <li key={event.id} className="py-2 first:pt-0 last:pb-0">
                <div className="flex items-baseline gap-2">
                  <Badge tone={event.kindKey === 'prompt' ? 'recall' : 'neutral'}>{event.kindKey}</Badge>
                  <span className="numeric text-[11px] text-dim">{formatTime(event.createdAt)}</span>
                </div>
                <p className="mt-1 max-w-[80ch] text-[12px] leading-relaxed whitespace-pre-wrap text-muted">
                  {event.input}
                </p>
                {typeof event.outcome === 'object' && event.outcome !== null && (
                  <pre className="mt-1 overflow-x-auto rounded-control border border-line bg-canvas px-2 py-1.5 font-mono text-[10.5px] text-dim">
                    {JSON.stringify(event.outcome)}
                  </pre>
                )}
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-4">
          <Panel title="Authored fixes" aside={`${plural(prompts.length, 'prompt')} sent`}>
            <ul className="divide-y divide-line">
              {room.fixes.map((fix) => (
                <li key={fix.filePath} className="py-2 first:pt-0 last:pb-0">
                  <div className="flex items-baseline gap-2">
                    <Badge tone={fix.applied ? 'held' : 'weak'}>{fix.applied ? 'applied' : 'not reached'}</Badge>
                    <span className="font-mono text-[11px] text-ink">{fix.filePath}</span>
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted">{fix.rationale}</p>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Files as they stand" aside={`${room.files?.length ?? 0} buffers`}>
            <ul className="divide-y divide-line">
              {(room.files ?? []).map((file) => (
                <li key={file.path} className="flex items-baseline justify-between gap-3 py-1.5 first:pt-0 last:pb-0">
                  <span className="font-mono text-[11px] text-ink">{file.path}</span>
                  <span className="numeric text-[11px] text-dim">
                    {file.contents.split('\n').length} lines{file.isCheck ? ' · check' : ''}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function readLink(roomId: string) {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(linkKey(roomId));
}

function formatTime(value?: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}
