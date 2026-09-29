export interface GraphTopic {
  slug: string;
  number: number;
  title: string;
  unlockRequiredLevel: number;
  prerequisites: { slug: string; critical?: boolean }[];
}

export interface BlockingRef {
  slug: string;
  requiredLevel: number;
  currentLevel: number;
}

export class CycleError extends Error {
  constructor(readonly cycle: string[]) {
    super(`curriculum dependency cycle: ${cycle.join(' -> ')}`);
    this.name = 'CycleError';
  }
}

const byStableOrder = (a: GraphTopic, b: GraphTopic) =>
  a.number - b.number || a.slug.localeCompare(b.slug);

/**
 * Prerequisite-first ordering, with the two failures a curriculum graph can actually
 * ship by accident — a cycle and a dangling reference — raised loudly at seed time.
 */
export function topologicalOrder(topics: GraphTopic[]): string[] {
  const graph = new Map(topics.map((t) => [t.slug, t]));
  const emitted = new Set<string>();
  const stack: string[] = [];
  const order: string[] = [];

  const visit = (slug: string) => {
    const node = graph.get(slug);
    if (!node) throw new Error(`unknown topic referenced as a prerequisite: ${slug}`);
    if (emitted.has(slug)) return;

    const reenter = stack.indexOf(slug);
    if (reenter >= 0) throw new CycleError([...stack.slice(reenter), slug]);

    stack.push(slug);
    for (const prerequisite of [...node.prerequisites].sort(
      (a, b) => a.slug.localeCompare(b.slug),
    )) {
      visit(prerequisite.slug);
    }
    stack.pop();

    if (!emitted.has(slug)) {
      emitted.add(slug);
      order.push(slug);
    }
  };

  for (const node of [...topics].sort(byStableOrder)) visit(node.slug);
  return order;
}

function levelOf(levels: Record<string, number>, slug: string): number {
  return levels[slug] ?? 0;
}

/** A topic unlocks only when every critical prerequisite has reached its required level. */
export function unlockState(
  topic: GraphTopic,
  levels: Record<string, number>,
): { unlocked: boolean; blockedBy: BlockingRef[]; warnings: BlockingRef[] } {
  const blockedBy: BlockingRef[] = [];
  const warnings: BlockingRef[] = [];

  for (const prerequisite of topic.prerequisites) {
    const currentLevel = levelOf(levels, prerequisite.slug);
    if (currentLevel >= topic.unlockRequiredLevel) continue;
    const ref = {
      slug: prerequisite.slug,
      requiredLevel: topic.unlockRequiredLevel,
      currentLevel,
    };
    (prerequisite.critical === false ? warnings : blockedBy).push(ref);
  }

  return { unlocked: blockedBy.length === 0, blockedBy, warnings };
}

/**
 * The concepts to repair before retrying a blocked topic, deepest first: repeated
 * failure on a topic is almost always failure on something underneath it.
 */
export function repairPath(
  startSlug: string,
  topics: GraphTopic[],
  levels: Record<string, number>,
): string[] {
  const graph = new Map(topics.map((t) => [t.slug, t]));
  const start = graph.get(startSlug);
  if (!start) throw new Error(`unknown topic: ${startSlug}`);

  const weak = new Set<string>();
  const visit = (topic: GraphTopic, seen: Set<string>) => {
    for (const prerequisite of topic.prerequisites) {
      if (prerequisite.critical === false) continue;
      if (seen.has(prerequisite.slug)) continue;
      seen.add(prerequisite.slug);

      const upstream = graph.get(prerequisite.slug);
      if (!upstream) throw new Error(`unknown topic referenced as a prerequisite: ${prerequisite.slug}`);

      if (levelOf(levels, prerequisite.slug) < topic.unlockRequiredLevel) {
        weak.add(prerequisite.slug);
        visit(upstream, seen);
      }
    }
  };
  visit(start, new Set([startSlug]));

  if (weak.size === 0) return [];
  // The weak set is a subset, not a graph: its members still reference strong topics outside
  // it, so ordering happens against the full graph and the result is filtered afterwards.
  return topologicalOrder(topics).filter((slug) => weak.has(slug));
}
