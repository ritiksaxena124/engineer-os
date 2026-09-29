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
 * evidence for one specific rung, which is what makes promotion auditable. */
export const SIGNALS = [
  { key: 'understanding', label: 'Explains the concept', weight: 10, levelKey: 'understanding' },
  { key: 'implementation', label: 'Built it', weight: 20, levelKey: 'implementation' },
  { key: 'debugging', label: 'Diagnosed a broken one', weight: 20, levelKey: 'debugging' },
  { key: 'testing', label: 'Wrote the tests that prove it', weight: 10, levelKey: 'implementation' },
  { key: 'design', label: 'Chose the right shape', weight: 15, levelKey: 'design' },
  { key: 'recall', label: 'Recalled it after a delay', weight: 10, levelKey: 'understanding' },
  { key: 'production-reasoning', label: 'Reasons about operating it', weight: 10, levelKey: 'production' },
  { key: 'interview-explanation', label: 'Argues trade-offs under pressure', weight: 5, levelKey: 'judgment' },
] as const;

export const QUESTION_CATEGORIES = [
  { key: 'conceptual', label: 'Conceptual', asks: 'what is it' },
  { key: 'why', label: 'Why', asks: 'what problem made it necessary' },
  { key: 'internal', label: 'Internal', asks: 'how does it actually work' },
  { key: 'implementation', label: 'Implementation', asks: 'build it' },
  { key: 'debugging', label: 'Debugging', asks: 'find and fix the fault' },
  { key: 'output-prediction', label: 'Output prediction', asks: 'what prints, and why' },
  { key: 'architecture', label: 'Architecture', asks: 'design the system' },
  { key: 'trade-off', label: 'Trade-off', asks: 'why this and not that' },
  { key: 'security', label: 'Security', asks: 'how is it attacked' },
  { key: 'performance', label: 'Performance', asks: 'where does the time go' },
  { key: 'production', label: 'Production', asks: 'what do you do at 3am' },
  { key: 'interview', label: 'Interview', asks: 'explain it in sixty seconds' },
  { key: 'senior-judgment', label: 'Senior judgment', asks: 'what would you not build' },
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
] as const;

export const ATTEMPT_VERDICTS = [
  { key: 'correct', label: 'Correct' },
  { key: 'partially-correct', label: 'Partially correct' },
  { key: 'shallow', label: 'Shallow' },
  { key: 'incorrect', label: 'Incorrect' },
  { key: 'unverifiable', label: 'Unverifiable' },
] as const;

export const ROLES = [{ key: 'learner', label: 'Learner' }];
