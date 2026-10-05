import { describe, expect, test } from 'bun:test';
import { ALL_PHASES, ALL_TOPICS, validateCurriculum, validateLessons } from '../prisma/content/curriculum';
import { LESSONS } from '../prisma/content/lessons';
import { TRACKS } from '../prisma/content/reference';
import { topologicalOrder, unlockState, type GraphTopic } from '../src/curriculum/graph';

const asGraphTopics = (): GraphTopic[] =>
  ALL_TOPICS.map((topic) => ({
    slug: topic.slug,
    number: topic.number,
    title: topic.title,
    unlockRequiredLevel: topic.unlockRequiredLevel,
    prerequisites: topic.prerequisites,
  }));

describe('curriculum content', () => {
  test('has no structural problems in the authored content', () => {
    expect(validateCurriculum()).toEqual([]);
  });

  test('covers all forty phases in order', () => {
    expect(ALL_PHASES).toHaveLength(40);
    expect(ALL_PHASES.map((phase) => phase.number)).toEqual(
      Array.from({ length: 40 }, (_, index) => index),
    );
    expect(ALL_PHASES.every((phase) => phase.tracks.length > 0)).toBe(true);
    for (const phase of ALL_PHASES) {
      for (const track of phase.tracks) {
        expect(TRACKS.map((entry) => entry.key)).toContain(track);
      }
    }
  });

  test('every lesson teaches the whole §43 anatomy or does not seed', () => {
    expect(validateLessons()).toEqual([]);
  });

  test('a module block is one unbroken run of topics inside its phase', () => {
    const runs: string[] = [];
    for (const phase of ALL_PHASES) {
      let previous: string | null = null;
      for (const topic of phase.topics) {
        if (!topic.module) continue;
        if (topic.module !== previous) {
          expect(runs).not.toContain(topic.module);
          runs.push(topic.module);
        }
        previous = topic.module;
      }
    }
    expect(runs).toEqual(['Module 01 · Foundations']);
  });

  test('every module topic is taught by a diagrammed, sourced lesson', () => {
    const taught = ALL_TOPICS.filter((topic) => topic.module);
    expect(taught).toHaveLength(13);

    for (const topic of taught) {
      const lessons = LESSONS.filter((lesson) => lesson.topicSlug === topic.slug);
      expect(lessons).toHaveLength(1);

      const bodies = lessons[0].sections.map((section) => section.body).join('\n');
      expect(bodies.split('```svg').length - 1).toBeGreaterThanOrEqual(1);
      expect(bodies.split('\n').filter((line) => line.trim().startsWith('[[source:'))).toHaveLength(1);
    }

    expect(new Set(taught.map((topic) => topic.phaseKey))).toEqual(new Set(['p18']));
  });

  test('the whole graph is a DAG: every prerequisite resolves and nothing cycles', () => {
    const order = topologicalOrder(asGraphTopics());
    expect(order).toHaveLength(ALL_TOPICS.length);

    for (const topic of ALL_TOPICS) {
      for (const prerequisite of topic.prerequisites) {
        expect(order.indexOf(prerequisite.slug)).toBeLessThan(order.indexOf(topic.slug));
      }
    }
  });

  test('the shared spine really is shared by all three tracks', () => {
    const allTracks = TRACKS.map((track) => track.key);
    for (const key of ['p00', 'p01', 'p02', 'p07']) {
      const phase = ALL_PHASES.find((entry) => entry.key === key);
      expect(phase?.tracks.slice().sort()).toEqual([...allTracks].sort());
    }
  });

  test('frontend stays out of the backend track and AI phases stay out of the full-stack one', () => {
    expect(ALL_PHASES.find((phase) => phase.key === 'p10')?.tracks).toEqual(['fullstack']);
    expect(ALL_PHASES.find((phase) => phase.key === 'p27')?.tracks).toEqual(['agentic-ai']);
    expect(ALL_PHASES.find((phase) => phase.key === 'p37')?.tracks).toContain('backend');
  });

  test('nothing unlocks before the learner can debug it', () => {
    const tooEasy = ALL_TOPICS.filter(
      (topic) => topic.prerequisites.some((prerequisite) => prerequisite.critical !== false) &&
        topic.unlockRequiredLevel < 3,
    );
    expect(tooEasy.map((topic) => topic.slug)).toEqual([]);
  });

  test('the capstone demands design level, not exposure', () => {
    const capstone = ALL_TOPICS.filter((topic) => topic.phaseKey === 'p39');
    expect(capstone.length).toBeGreaterThan(0);
    expect(capstone.every((topic) => topic.unlockRequiredLevel >= 4)).toBe(true);
  });

  test('a brand new learner is gated at the frontier, not everywhere', () => {
    const topics = asGraphTopics();
    const levels: Record<string, number> = {};

    const available = topics.filter((topic) => unlockState(topic, levels).unlocked);
    const blocked = topics.filter((topic) => !unlockState(topic, levels).unlocked);

    // Only the roots are open at level zero; nothing with a critical prerequisite is.
    expect(available.every((topic) => topic.prerequisites.every((p) => p.critical === false))).toBe(true);
    expect(available.length).toBeGreaterThan(0);
    expect(blocked.some((topic) => topic.slug === 'mvcc-isolation')).toBe(true);
    expect(blocked.some((topic) => topic.slug === 'agents' || topic.slug === 'what-an-agent-is')).toBe(true);
  });

  test('advisory prerequisites warn without blocking', () => {
    const cacheInvalidation = asGraphTopics().find((topic) => topic.slug === 'cache-invalidation');
    expect(cacheInvalidation?.prerequisites.some((p) => p.critical === false)).toBe(true);

    const { unlocked, warnings } = unlockState(cacheInvalidation!, { 'cache-patterns': 3 });
    expect(unlocked).toBe(true);
    expect(warnings.length).toBeGreaterThan(0);
  });
});
