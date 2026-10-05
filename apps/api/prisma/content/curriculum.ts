import { PHASES_00_09 } from './phases-00-09';
import { PHASES_10_19 } from './phases-10-19';
import { PHASES_20_29 } from './phases-20-29';
import { PHASES_30_39 } from './phases-30-39';
import { LESSON_ANATOMY, LESSONS } from './lessons';
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

const SOURCE_DIRECTIVE = /^\[\[source:\s*[^|\]]+\|\s*https?:\/\/[^\]\s]+\s*\]\]$/;

/**
 * The two authoring directives the lesson page renders — a fenced svg block and a source line — are
 * checked here because they reach the browser as HTML: an unbalanced fence silently eats the rest of
 * the section, and script or handler markup inside a diagram would be executed by the page.
 */
function validateDirectives(slug: string, kind: string, body: string, problems: string[]): void {
  const lines = body.split('\n');
  let figure: string[] | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('[[source:')) {
      if (!SOURCE_DIRECTIVE.test(trimmed)) {
        problems.push(`lesson "${slug}" section "${kind}" has a malformed source directive: ${trimmed}`);
      }
      continue;
    }

    if (figure) {
      if (trimmed === '```') {
        const markup = figure.join('\n').trim();
        if (!markup.startsWith('<svg') || !markup.endsWith('</svg>')) {
          problems.push(`lesson "${slug}" section "${kind}" has an svg block that is not one svg element`);
        }
        if (/<script|javascript:|\son[a-z]+\s*=/i.test(markup)) {
          problems.push(`lesson "${slug}" section "${kind}" has executable markup in a diagram`);
        }
        figure = null;
        continue;
      }
      figure.push(line);
      continue;
    }

    if (trimmed === '```svg') {
      figure = [];
      continue;
    }

    if (trimmed.startsWith('```')) {
      problems.push(`lesson "${slug}" section "${kind}" opens a fence that is not an svg block`);
    }
  }

  if (figure) problems.push(`lesson "${slug}" section "${kind}" leaves an svg block unclosed`);
}

/** §43: a lesson that skips a rung of the anatomy has not taught the concept, it has named it. */
export function validateLessons(): string[] {  const problems: string[] = [];
  const topicSlugs = new Set(ALL_TOPICS.map((topic) => topic.slug));
  const lessonSlugs = new Set<string>();

  for (const lesson of LESSONS) {
    if (lessonSlugs.has(lesson.slug)) problems.push(`duplicate lesson slug "${lesson.slug}"`);
    lessonSlugs.add(lesson.slug);

    if (!topicSlugs.has(lesson.topicSlug)) {
      problems.push(`lesson "${lesson.slug}" belongs to unknown topic "${lesson.topicSlug}"`);
    }

    const kinds = lesson.sections.map((section) => section.kind);
    const missing = LESSON_ANATOMY.filter((kind) => !kinds.includes(kind));
    for (const kind of missing) {
      problems.push(`lesson "${lesson.slug}" is missing the "${kind}" section`);
    }
    for (const kind of kinds) {
      if (!LESSON_ANATOMY.includes(kind as (typeof LESSON_ANATOMY)[number])) {
        problems.push(`lesson "${lesson.slug}" uses unknown section kind "${kind}"`);
      }
      if (kinds.filter((entry) => entry === kind).length > 1) {
        problems.push(`lesson "${lesson.slug}" repeats the "${kind}" section`);
      }
    }
    for (const section of lesson.sections) {
      if (section.body.trim().length < 80) {
        problems.push(`lesson "${lesson.slug}" section "${section.kind}" is too thin to teach anything`);
      }
      validateDirectives(lesson.slug, section.kind, section.body, problems);
    }
  }

  return problems;
}
