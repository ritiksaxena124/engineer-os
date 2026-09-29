import { repairPath, topologicalOrder, type GraphTopic } from '../curriculum/graph';
import { PASS_SCORE } from './derivation';

/**
 * Two misses is a bad evening. Three in a row is a pattern, and it is the pattern the learner
 * cannot argue with — so this is the number the report is built on and the number the UI quotes.
 */
export const REPEATED_FAILURE_STREAK = 3;

export interface AttemptRow {
  topicSlug: string;
  questionSlug: string;
  score: number;
  at: Date;
  /** A placement answer says where to start, not what the learner can still do. */
  isDiagnostic: boolean;
}

export interface WeaknessFinding {
  topicSlug: string;
  /** Misses since the last answer that passed, which is what "repeated" means here. */
  failedStreak: number;
  attempts: number;
  /** The weak prerequisites, shallowest first. Empty when nothing underneath is weak. */
  repairPath: string[];
  /** The one topic the next hour should actually be spent on. */
  rootCauseSlug: string;
}

function trailingFailures(rows: AttemptRow[]): number {
  let streak = 0;
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    if (rows[index].score >= PASS_SCORE) break;
    streak += 1;
  }
  return streak;
}

/**
 * §71 again: a weakness is derived from the attempt ledger, never stored. The point of the walk
 * is that failure on a topic is usually evidence about something underneath it — drilling the
 * topic again measures the same gap more expensively.
 */
export function detectWeaknesses(
  attempts: AttemptRow[],
  topics: GraphTopic[],
  levels: Record<string, number>,
  threshold = REPEATED_FAILURE_STREAK,
): WeaknessFinding[] {
  const inGraph = new Set(topics.map((topic) => topic.slug));

  const byTopic = new Map<string, AttemptRow[]>();
  for (const row of attempts) {
    // An attempt on a topic that has been withdrawn from the graph has nowhere to be walked back to.
    if (row.isDiagnostic || !inGraph.has(row.topicSlug)) continue;
    const rows = byTopic.get(row.topicSlug);
    if (rows) rows.push(row);
    else byTopic.set(row.topicSlug, [row]);
  }

  const findings: WeaknessFinding[] = [];
  for (const [topicSlug, rows] of byTopic) {
    rows.sort((a, b) => a.at.getTime() - b.at.getTime());
    const failedStreak = trailingFailures(rows);
    if (failedStreak < threshold) continue;

    const path = repairPath(topicSlug, topics, levels);
    findings.push({
      topicSlug,
      failedStreak,
      attempts: rows.length,
      repairPath: path,
      rootCauseSlug: path[0] ?? topicSlug,
    });
  }

  // Curriculum order, not newest-first: the report is read as a plan, and the repair is above.
  const rank = new Map(topologicalOrder(topics).map((slug, index) => [slug, index]));
  return findings.sort(
    (a, b) => rank.get(a.topicSlug)! - rank.get(b.topicSlug)! || a.topicSlug.localeCompare(b.topicSlug),
  );
}
