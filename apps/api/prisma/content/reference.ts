export const TRACKS = [
  { key: 'backend', name: 'Senior Backend Engineer', blurb: 'Systems, data, distributed correctness, production ownership.', sortOrder: 1 },
  { key: 'fullstack', name: 'Senior Full-Stack Engineer', blurb: 'Backend spine plus frontend rendering, state and Next.js.', sortOrder: 2 },
  { key: 'agentic-ai', name: 'Applied / Agentic AI Engineer', blurb: 'Backend spine plus LLM applications, evaluation, agents, production AI.', sortOrder: 3 },
] as const;

export const SKILLS = [
  'javascript', 'typescript', 'node', 'http', 'rest', 'nestjs', 'react', 'nextjs',
  'postgresql', 'redis', 'testing', 'security', 'linux', 'docker', 'cicd',
  'system-design', 'distributed-systems', 'cloud', 'observability', 'llm', 'rag',
  'evaluation', 'agents', 'langgraph', 'mcp', 'ai-systems', 'leadership',
].map((key) => ({ key, label: key }));

export const MASTERY_LEVELS = [
  { key: 'exposure', number: 0, label: 'Exposure', capability: 'recognises the terminology', sortOrder: 0 },
  { key: 'understanding', number: 1, label: 'Understanding', capability: 'can explain the concept plainly', sortOrder: 1 },
  { key: 'implementation', number: 2, label: 'Implementation', capability: 'can build it', sortOrder: 2 },
  { key: 'debugging', number: 3, label: 'Debugging', capability: 'can diagnose a broken one', sortOrder: 3 },
  { key: 'design', number: 4, label: 'Design', capability: 'can choose the right architecture', sortOrder: 4 },
  { key: 'production', number: 5, label: 'Production', capability: 'operates it under failure, load and observation', sortOrder: 5 },
  { key: 'judgment', number: 6, label: 'Senior Judgment', capability: 'argues trade-offs and constraints', sortOrder: 6 },
  { key: 'teaching', number: 7, label: 'Teaching', capability: 'can teach another engineer', sortOrder: 7 },
] as const;

/** §71 — mastery is the aggregate of these signals, never a read lesson. Each signal is
 * evidence for one specific rung, which is what makes promotion auditable. evidencedByReview
 * marks the dimension a scheduled review speaks for: recall is the only one, because answering
 * after a delay is a different claim than answering now. */
export const SIGNALS = [
  { key: 'understanding', label: 'Explains the concept', weight: 10, levelKey: 'understanding', evidencedByReview: false },
  { key: 'implementation', label: 'Built it', weight: 20, levelKey: 'implementation', evidencedByReview: false },
  { key: 'debugging', label: 'Diagnosed a broken one', weight: 20, levelKey: 'debugging', evidencedByReview: false },
  { key: 'testing', label: 'Wrote the tests that prove it', weight: 10, levelKey: 'implementation', evidencedByReview: false },
  { key: 'design', label: 'Chose the right shape', weight: 15, levelKey: 'design', evidencedByReview: false },
  { key: 'recall', label: 'Recalled it after a delay', weight: 10, levelKey: 'understanding', evidencedByReview: true },
  { key: 'production-reasoning', label: 'Reasons about operating it', weight: 10, levelKey: 'production', evidencedByReview: false },
  { key: 'interview-explanation', label: 'Argues trade-offs under pressure', weight: 5, levelKey: 'judgment', evidencedByReview: false },
] as const;

/**
 * signalKey is the dimension a correct answer to this category is evidence for, which is what
 * lets a promotion be audited from the question alone. `testing` and `recall` are deliberately
 * absent here: tests are evidence from exercises, and recall from a review taken on its due day.
 */
export const QUESTION_CATEGORIES = [
  { key: 'conceptual', label: 'Conceptual', asks: 'what is it', signalKey: 'understanding' },
  { key: 'why', label: 'Why', asks: 'what problem made it necessary', signalKey: 'understanding' },
  { key: 'internal', label: 'Internal', asks: 'how does it actually work', signalKey: 'understanding' },
  { key: 'implementation', label: 'Implementation', asks: 'build it', signalKey: 'implementation' },
  { key: 'debugging', label: 'Debugging', asks: 'find and fix the fault', signalKey: 'debugging' },
  { key: 'output-prediction', label: 'Output prediction', asks: 'what prints, and why', signalKey: 'implementation' },
  { key: 'architecture', label: 'Architecture', asks: 'design the system', signalKey: 'design' },
  { key: 'trade-off', label: 'Trade-off', asks: 'why this and not that', signalKey: 'design' },
  { key: 'security', label: 'Security', asks: 'how is it attacked', signalKey: 'production-reasoning' },
  { key: 'performance', label: 'Performance', asks: 'where does the time go', signalKey: 'production-reasoning' },
  { key: 'production', label: 'Production', asks: 'what do you do at 3am', signalKey: 'production-reasoning' },
  { key: 'interview', label: 'Interview', asks: 'explain it in sixty seconds', signalKey: 'interview-explanation' },
  { key: 'senior-judgment', label: 'Senior judgment', asks: 'what would you not build', signalKey: 'interview-explanation' },
] as const;

/** §43 — the anatomy every lesson must be able to express. */
export const LESSON_SECTION_KINDS = [
  { key: 'why-it-exists', label: 'Why it exists', guidance: 'the problem that made this necessary', sortOrder: 1 },
  { key: 'naive-solution', label: 'Naive solution', guidance: 'what a reasonable developer writes first', sortOrder: 2 },
  { key: 'why-naive-fails', label: 'Why the naive solution fails', guidance: 'concrete failure, not opinion', sortOrder: 3 },
  { key: 'mental-model', label: 'Mental model', guidance: 'the picture to hold in your head', sortOrder: 4 },
  { key: 'internals', label: 'Internal mechanism', guidance: 'what actually happens, step by step', sortOrder: 5 },
  { key: 'production-implementation', label: 'Production implementation', guidance: 'correct code with real constraints', sortOrder: 6 },
  { key: 'bad-implementation', label: 'Bad implementation', guidance: 'code that passes tests and ships incidents', sortOrder: 7 },
  { key: 'testing', label: 'Testing', guidance: 'what to assert and why', sortOrder: 8 },
  { key: 'failure-scenarios', label: 'Failure scenarios', guidance: 'partial failure, retries, duplicates', sortOrder: 9 },
  { key: 'performance', label: 'Performance', guidance: 'measured cost, not folklore', sortOrder: 10 },
  { key: 'security', label: 'Security', guidance: 'the attack path', sortOrder: 11 },
  { key: 'trade-offs', label: 'Trade-offs', guidance: 'alternatives and when each wins', sortOrder: 12 },
  { key: 'system-design', label: 'System design', guidance: 'where this sits in a larger system', sortOrder: 13 },
  { key: 'interview', label: 'Interview', guidance: 'the sixty-second version and the follow-ups', sortOrder: 14 },
  { key: 'real-world', label: 'Real-world scenario', guidance: 'a production story with numbers', sortOrder: 15 },
  { key: 'mini-project', label: 'Mini project', guidance: 'the build that proves it', sortOrder: 16 },
] as const;

export const SESSION_TYPES = [
  { key: 'learn', label: 'Learn', purpose: 'first pass at a new concept' },
  { key: 'practice', label: 'Practice', purpose: 'recall and application drills' },
  { key: 'debug', label: 'Debug', purpose: 'diagnose broken implementations' },
  { key: 'build', label: 'Build', purpose: 'implementation challenges' },
  { key: 'interview', label: 'Interview', purpose: 'answered under interview pressure' },
  { key: 'system-design', label: 'System Design', purpose: 'design end to end' },
  { key: 'incident', label: 'Production Incident', purpose: 'triage a live failure' },
  { key: 'code-review', label: 'Code Review', purpose: 'review deliberately flawed code' },
  { key: 'teach-back', label: 'Teach Back', purpose: 'explain it to a junior engineer' },
  { key: 'revision', label: 'Revision', purpose: 'scheduled spaced repetition' },
  { key: 'exam', label: 'Exam', purpose: 'phase assessment Parts A-G' },
  { key: 'diagnostic', label: 'Diagnostic', purpose: 'placement across the graph, reported and never promoted' },
] as const;

/**
 * §70 — a phase is examined in seven parts, each one a different kind of work, so passing the exam
 * means the concept survived being asked seven different ways. `categoryKeys` is how a part selects
 * its items from the bank within the phase; a part with `generated` has no authored question row
 * because it is addressed to the topic itself — the learner explains that topic's concepts to a
 * junior engineer, and the rubric is those concepts.
 */
export const EXAM_PARTS = [
  {
    key: 'theory',
    label: 'Part A — Theory',
    position: 1,
    minutes: 30,
    items: 20,
    sessionTypeKey: 'exam',
    instructions: 'What the phase claims the concept is. Answer in full sentences, not arrows.',
    categoryKeys: ['conceptual', 'why', 'internal', 'output-prediction'],
    generated: null,
  },
  {
    key: 'implementation',
    label: 'Part B — Implementation',
    position: 2,
    minutes: 40,
    items: 3,
    sessionTypeKey: 'build',
    instructions: 'Write the thing. Pseudocode is not an implementation.',
    categoryKeys: ['implementation'],
    generated: null,
  },
  {
    key: 'debugging',
    label: 'Part C — Debugging',
    position: 3,
    minutes: 30,
    items: 2,
    sessionTypeKey: 'debug',
    instructions: 'Two broken applications. Name the fault, the mechanism, and the fix.',
    categoryKeys: ['debugging'],
    generated: null,
  },
  {
    key: 'architecture',
    label: 'Part D — Architecture',
    position: 4,
    minutes: 30,
    items: 1,
    sessionTypeKey: 'system-design',
    instructions: 'One design problem, end to end, with the constraint that decides it.',
    categoryKeys: ['architecture', 'trade-off'],
    generated: null,
  },
  {
    key: 'production',
    label: 'Part E — Production',
    position: 5,
    minutes: 20,
    items: 1,
    sessionTypeKey: 'incident',
    instructions: 'One incident. Triage it live: what you check first and what you stop doing.',
    categoryKeys: ['production', 'security', 'performance'],
    generated: null,
  },
  {
    key: 'interview',
    label: 'Part F — Interview',
    position: 6,
    minutes: 10,
    items: 3,
    sessionTypeKey: 'interview',
    instructions: 'Ten minutes, out loud, in order. The interviewer stops you if you ramble.',
    categoryKeys: ['interview', 'senior-judgment'],
    generated: null,
  },
  {
    key: 'teaching',
    label: 'Part G — Teaching',
    position: 7,
    minutes: 15,
    items: 1,
    sessionTypeKey: 'teach-back',
    instructions:
      'Explain the topic to a junior engineer who has to use it today. No jargon that is not defined.',
    categoryKeys: [],
    generated: 'teach-back',
  },
] as const;

export const ATTEMPT_VERDICTS = [
  { key: 'correct', label: 'Correct' },
  { key: 'partially-correct', label: 'Partially correct' },
  { key: 'shallow', label: 'Shallow' },
  { key: 'incorrect', label: 'Incorrect' },
  { key: 'unverifiable', label: 'Unverifiable' },
] as const;

export const ROLES = [{ key: 'learner', label: 'Learner' }];

/**
 * The lookup tables reference each other by key, and nothing in Postgres can check that until
 * the rows exist — so a category pointing at a signal that was renamed, or a rung with no
 * evidence dimension feeding it, is caught here at seed time instead of as a silent non-promotion.
 */
export function validateReference(): string[] {
  const problems: string[] = [];
  // Widened on purpose: the literals are `as const`, so a branch that is unreachable for today's
  // content would be typed `never` and the check would stop existing when content changes.
  const levels: Set<string> = new Set(MASTERY_LEVELS.map((level) => level.key));
  const signals: Set<string> = new Set(SIGNALS.map((signal) => signal.key));
  const categories: { key: string; signalKey: string | null }[] = QUESTION_CATEGORIES.map((category) => ({
    key: category.key,
    signalKey: category.signalKey,
  }));

  const signalRows: { key: string; levelKey: string }[] = SIGNALS.map((signal) => ({
    key: signal.key,
    levelKey: signal.levelKey,
  }));

  for (const signal of signalRows) {
    if (!levels.has(signal.levelKey)) {
      problems.push(`signal "${signal.key}" feeds unknown mastery level "${signal.levelKey}"`);
    }
  }

  for (const category of categories) {
    if (!category.signalKey) {
      problems.push(`category "${category.key}" records no mastery signal, so it can never promote anyone`);
    } else if (!signals.has(category.signalKey)) {
      problems.push(`category "${category.key}" references unknown signal "${category.signalKey}"`);
    }
  }

  // A rung with no evidence dimension in the middle of the ladder is a step nobody can climb.
  // The top of the ladder may legitimately be unfed for now — it waits for a signal that does
  // not exist yet — but nothing below the highest fed rung may be empty.
  const feedable: Set<string> = new Set(SIGNALS.map((signal) => signal.levelKey));
  const fedNumbers = MASTERY_LEVELS.filter((level) => feedable.has(level.key)).map((level) => level.number);
  const highestFed = Math.max(...fedNumbers);
  for (const level of MASTERY_LEVELS) {
    if (level.number > 0 && level.number <= highestFed && !feedable.has(level.key)) {
      problems.push(`mastery level "${level.key}" has no signal that can evidence it`);
    }
  }

  const reviewDimensions = SIGNALS.filter((signal) => signal.evidencedByReview);
  if (reviewDimensions.length !== 1) {
    problems.push(`exactly one signal must be evidencedByReview, found ${reviewDimensions.length}`);
  }

  const sessionTypes: Set<string> = new Set(SESSION_TYPES.map((type) => type.key));
  const categoryKeys: Set<string> = new Set(QUESTION_CATEGORIES.map((category) => category.key));
  const positions = EXAM_PARTS.map((part) => part.position).sort((a, b) => a - b);
  positions.forEach((position, index) => {
    if (position !== index + 1) problems.push(`exam part positions are not contiguous: ${positions.join(',')}`);
  });
  // Widened for the same reason as the tables above: the literals are `as const`, so the part with
  // no categories of its own would be typed out of existence and the check would stop running.
  const parts: { key: string; sessionTypeKey: string; categoryKeys: readonly string[]; generated: string | null }[] =
    EXAM_PARTS.map((part) => ({
      key: part.key,
      sessionTypeKey: part.sessionTypeKey,
      categoryKeys: part.categoryKeys,
      generated: part.generated,
    }));

  const seenParts = new Set<string>();
  for (const part of parts) {
    if (seenParts.has(part.key)) problems.push(`exam part "${part.key}" is defined twice`);
    seenParts.add(part.key);
    if (!sessionTypes.has(part.sessionTypeKey)) {
      problems.push(`exam part "${part.key}" opens session type "${part.sessionTypeKey}" which does not exist`);
    }
    if (part.generated === null && part.categoryKeys.length === 0) {
      problems.push(`exam part "${part.key}" selects no category and generates nothing, so it can never have items`);
    }
    for (const category of part.categoryKeys) {
      if (!categoryKeys.has(category)) problems.push(`exam part "${part.key}" selects unknown category "${category}"`);
    }
  }

  return problems;
}
