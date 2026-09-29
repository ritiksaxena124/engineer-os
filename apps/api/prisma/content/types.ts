export type TrackKey = 'backend' | 'fullstack' | 'agentic-ai';

export interface TopicSpec {
  slug: string;
  title: string;
  summary: string;
  /** skill matrix key (§93) this topic contributes to */
  skill?: string;
  /** level a prerequisite must reach before this topic unlocks; defaults to 3 (Can Debug) */
  unlockRequiredLevel?: number;
  prerequisites: { slug: string; critical?: boolean }[];
}

export interface PhaseSpec {
  key: string;
  number: number;
  title: string;
  summary: string;
  tracks: TrackKey[];
  topics: TopicSpec[];
}

/**
 * One concept a real answer must touch. `terms` are the phrasings a learner is allowed to
 * use — grading looks for evidence of the idea, not for the exact words of the answer key.
 */
export interface ConceptSpec {
  slug: string;
  name: string;
  detail: string;
  terms: string[];
  weight?: number;
}

/** §44 answer model: seven fields, because a mentor owes the learner more than a solution. */
export interface AnswerSpec {
  shortAnswer: string;
  idealAnswer: string;
  deepAnswer: string;
  commonMistakes: string;
  whyWrong: string;
  followUps: string;
  exercise: string;
}

export interface QuestionSpec {
  slug: string;
  topicSlug: string;
  categoryKey: string;
  /** the rung a strong answer demonstrates (§45 ladder) */
  levelKey: string;
  /** 1 exposure · 2 explanation · 3 application · 4 diagnosis · 5 design · 6 production · 7 teaching */
  difficulty: number;
  stem: string;
  body: string;
  concepts: ConceptSpec[];
  answer: AnswerSpec;
  /** diagnostic questions are answerable before anything unlocks — that is how gaps are found */
  isDiagnostic?: boolean;
  lessonSlug?: string;
}
