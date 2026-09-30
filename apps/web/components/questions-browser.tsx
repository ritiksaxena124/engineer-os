"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { Badge, Panel, inputClass } from "@/components/ui";
import { Empty, Failure, Loading } from "@/components/states";
import { useQuery } from "@/lib/useQuery";
import type { QuestionFacets, QuestionSummary, Topic } from "@/lib/types";

interface Browse {
  questions: QuestionSummary[];
  facets: QuestionFacets;
}

const RUNGS = [1, 2, 3, 4, 5, 6, 7];
const control = `${inputClass} w-auto shrink-0 py-1 text-[12px]`;

function Chip({
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
          ? "border-accent/50 bg-accent/15 text-accent"
          : "border-line-strong bg-transparent text-muted hover:bg-raised hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * The bank read as a work list rather than as a syllabus: what is asked where, at which rung, and
 * nothing of the answer model until the drill has been sat.
 */
export function QuestionsBrowser() {
  const [company, setCompany] = useState("all");
  const [floor, setFloor] = useState(1);
  const [ceiling, setCeiling] = useState(7);
  const [needle, setNeedle] = useState("");
  const [order, setOrder] = useState<"asc" | "desc" | "title">("asc");

  const query = useQuery<Browse>(
    `questions?diagnostic=false&minDifficulty=${floor}&maxDifficulty=${ceiling}` +
      (company === "all" ? "" : `&company=${company}`),
  );
  const topics = useQuery<{ topics: Topic[] }>("curriculum/topics");

  const error = query.error ?? topics.error;
  if (error) return <Failure error={error} onRetry={query.reload} />;
  if (query.loading || topics.loading || !query.data || !topics.data)
    return <Loading />;

  const unlocked = new Set(
    topics.data.topics
      .filter((topic) => topic.unlocked)
      .map((topic) => topic.slug),
  );
  const inRange = query.data.facets.difficulties.reduce(
    (total, rung) => total + rung.count,
    0,
  );
  const hunt = needle.trim().toLowerCase();

  const rows = query.data.questions
    .filter(
      (question) =>
        !hunt ||
        question.stem.toLowerCase().includes(hunt) ||
        question.topicSlug.toLowerCase().includes(hunt),
    )
    .sort((a, b) =>
      order === "title"
        ? a.stem.localeCompare(b.stem)
        : order === "asc"
          ? a.difficulty - b.difficulty || a.slug.localeCompare(b.slug)
          : b.difficulty - a.difficulty || a.slug.localeCompare(b.slug),
    );

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between gap-6 border-b border-line pb-4">
        <div>
          <h1 className="text-[20px] tracking-tight text-ink">Questions</h1>
          <p className="mt-1 text-[12px] text-muted">
            The whole bank, tagged by who asks it and by the rung a correct
            answer demonstrates. The answer model opens after you answer, never
            before.
          </p>
        </div>
        <input
          className={`${inputClass} w-64`}
          placeholder="filter by stem or topic"
          value={needle}
          onChange={(event) => setNeedle(event.target.value)}
        />
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-wide text-dim">
          Asked at
        </span>
        <Chip active={company === "all"} onClick={() => setCompany("all")}>
          All <span className="numeric text-dim">{inRange}</span>
        </Chip>
        {query.data.facets.companies.map((facet) => (
          <Chip
            key={facet.key}
            active={company === facet.key}
            onClick={() => setCompany(facet.key)}
          >
            {facet.label}{" "}
            <span className="numeric text-dim">{facet.count}</span>
          </Chip>
        ))}
        <Chip
          active={company === "untagged"}
          onClick={() => setCompany("untagged")}
        >
          Untagged{" "}
          <span className="numeric text-dim">{query.data.facets.untagged}</span>
        </Chip>

        <span className="ml-auto flex items-center gap-2">
          <label
            className="text-[11px] uppercase tracking-wide text-dim"
            htmlFor="questions-floor"
          >
            rung
          </label>
          <select
            id="questions-floor"
            className={control}
            value={floor}
            onChange={(event) => {
              const next = Number(event.target.value);
              setFloor(next);
              if (next > ceiling) setCeiling(next);
            }}
          >
            {RUNGS.map((rung) => (
              <option key={rung} value={rung}>
                from D{rung}
              </option>
            ))}
          </select>
          <select
            className={control}
            aria-label="highest rung to show"
            value={ceiling}
            onChange={(event) => {
              const next = Number(event.target.value);
              setCeiling(next);
              if (next < floor) setFloor(next);
            }}
          >
            {RUNGS.map((rung) => (
              <option key={rung} value={rung}>
                to D{rung}
              </option>
            ))}
          </select>
          <select
            className={control}
            aria-label="sort order"
            value={order}
            onChange={(event) => setOrder(event.target.value as typeof order)}
          >
            <option value="asc">easiest first</option>
            <option value="desc">hardest first</option>
            <option value="title">a–z</option>
          </select>
        </span>
      </div>

      <Panel
        title="Bank"
        aside={`${rows.length} shown of ${query.data.questions.length} in this filter`}
      >
        {rows.length === 0 ? (
          <Empty title="Nothing matches that filter.">
            Widen the rung range, clear the search, or pick All to see the bank
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
                      <span className="text-[12px] text-dim">
                        {question.stem}
                      </span>
                    )}
                    <span className="mt-0.5 block truncate text-[11px] text-dim">
                      {question.topicSlug} · {question.category} ·{" "}
                      {question.conceptCount} concepts to touch
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    {(question.companies ?? []).map((tag) => (
                      <Badge key={tag.key} tone="neutral">
                        {tag.label}
                      </Badge>
                    ))}
                    <Badge tone="neutral">{question.levelKey}</Badge>
                    <span className="numeric text-[11px] text-muted">
                      D{question.difficulty}
                    </span>
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
