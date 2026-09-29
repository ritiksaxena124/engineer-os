import { PHASES_00_09 } from './phases-00-09';
import { PHASES_10_19 } from './phases-10-19';
import { PHASES_20_29 } from './phases-20-29';
import { PHASES_30_39 } from './phases-30-39';
import { SKILLS } from './reference';
import type { PhaseSpec, TopicSpec } from './types';

export const ALL_PHASES: PhaseSpec[] = [
  ...PHASES_00_09,
  ...PHASES_10_19,
  ...PHASES_20_29,
  ...PHASES_30_39,
];

export interface ResolvedTopic extends TopicSpec {
  phaseKey: string;
  number: number;
  unlockRequiredLevel: number;
}

export const ALL_TOPICS: ResolvedTopic[] = ALL_PHASES.flatMap((phase) =>
  phase.topics.map((topic, index) => ({
    ...topic,
    phaseKey: phase.key,
    number: index + 1,
    unlockRequiredLevel: topic.unlockRequiredLevel ?? 3,
  })),
);

const SKILL_KEYS = new Set(SKILLS.map((skill) => skill.key));

/** Content errors the graph cannot catch: duplicate slugs, unknown skill buckets, bad phases. */
export function validateCurriculum(): string[] {
  const problems: string[] = [];
  const seenSlugs = new Map<string, string>();

  for (const phase of ALL_PHASES) {
    if (phase.topics.length === 0) problems.push(`phase ${phase.key} has no topics`);
    for (const topic of phase.topics) {
      const previous = seenSlugs.get(topic.slug);
      if (previous) {
        problems.push(`duplicate topic slug "${topic.slug}" in ${previous} and ${phase.key}`);
      }
      seenSlugs.set(topic.slug, phase.key);
      if (topic.skill && !SKILL_KEYS.has(topic.skill)) {
        problems.push(`topic "${topic.slug}" has unknown skill "${topic.skill}"`);
      }
    }
  }

  const phaseNumbers = ALL_PHASES.map((phase) => phase.number);
  for (let expected = 0; expected < 40; expected += 1) {
    if (!phaseNumbers.includes(expected)) problems.push(`missing phase number ${expected}`);
  }

  const position = new Map<string, number>();
  for (const phase of ALL_PHASES) {
    phase.topics.forEach((topic, index) => {
      if (!position.has(topic.slug)) position.set(topic.slug, phase.number * 1000 + index);
    });
  }

  for (const topic of ALL_TOPICS) {
    const own = position.get(topic.slug) ?? 0;
    for (const prerequisite of topic.prerequisites) {
      if (prerequisite.slug === topic.slug) {
        problems.push(`topic "${topic.slug}" lists itself as a prerequisite`);
      }
      if (!seenSlugs.has(prerequisite.slug)) {
        problems.push(`topic "${topic.slug}" references unknown prerequisite "${prerequisite.slug}"`);
      } else if ((position.get(prerequisite.slug) ?? 0) >= own) {
        problems.push(
          `topic "${topic.slug}" depends forward on "${prerequisite.slug}"; prerequisites must already exist`,
        );
      }
    }
  }

  return problems;
}
