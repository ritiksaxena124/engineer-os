export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  roleKey: string;
}

export interface BlockingRef {
  slug: string;
  requiredLevel: number;
  currentLevel: number;
}

export interface Phase {
  key: string;
  number: number;
  title: string;
  summary: string;
  topicCount: number;
}

export interface Topic {
  slug: string;
  title: string;
  summary: string;
  phaseKey: string;
  number: number;
  skillKey: string | null;
  unlockRequiredLevel: number;
  level: number;
  unlocked: boolean;
  blockedBy: BlockingRef[];
  warnings: BlockingRef[];
}

export interface RepairStep {
  slug: string;
  title: string;
  phaseKey: string;
  currentLevel: number;
}

export interface LessonSummary {
  slug: string;
  title: string;
  topicSlug: string;
  sectionCount: number;
  readAt: string | null;
}

export interface LessonSection {
  kind: string;
  label: string;
  guidance: string;
  body: string;
  position: number;
}

export interface Lesson {
  slug: string;
  title: string;
  topicSlug: string;
  readAt: string | null;
  sections: LessonSection[];
}

export interface QuestionSummary {
  slug: string;
  stem: string;
  topicSlug: string;
  category: string;
  categoryLabel?: string;
  difficulty: number;
  levelKey: string;
  isDiagnostic: boolean;
  conceptCount: number;
  attemptCount?: number;
  body?: string;
  answer?: AnswerModel | null;
}

export interface AnswerModel {
  shortAnswer: string;
  idealAnswer: string;
  deepAnswer: string;
  commonMistakes: string;
  whyWrong: string;
  followUps: string;
  exercise: string;
}

export type Verdict = 'correct' | 'partially-correct' | 'shallow' | 'incorrect' | 'unverifiable';

export interface Standing {
  topicSlug: string;
  level: number;
  levelKey: string;
  previousLevel: number;
  score: number;
  signals: {
    key: string;
    weight: number;
    levelNumber: number;
    score: number;
    evidenceCount: number;
  }[];
}

export interface Review {
  questionSlug: string;
  topicSlug: string;
  difficulty: number;
  dueAt: string;
  intervalDays: number;
  lapseCount: number;
}

export interface Weakness {
  topicSlug: string;
  title: string;
  phaseKey: string;
  level: number;
  requiredLevel: number;
  failedStreak: number;
  attempts: number;
  lapses: number;
  rootCause: RepairStep;
  repairPath: RepairStep[];
  action: string;
}

export interface AttemptResult {
  verdict: Verdict;
  score: number;
  coverage: number;
  missing: string[];
  feedback: string;
  evidence: { topicSlug: string; level: number; levelKey: string; previousLevel: number; score: number } | null;
  review: { intervalDays: number; dueAt: string; lapseCount: number } | null;
  answer: AnswerModel | null;
}

export interface DiagnosticItem {
  slug: string;
  stem: string;
  body: string | null;
  difficulty: number;
  category: string;
  levelKey: string;
  topicSlug: string;
  conceptCount: number;
}

export interface DiagnosticSession {
  sessionId: string;
  plannedMinutes: number;
  items: DiagnosticItem[];
}

export interface DiagnosticReport {
  sessionId: string;
  answered: number;
  unanswered: number;
  verdicts: { slug: string; verdict: string; score: number; missing: string[] }[];
  weakTopics: { slug: string; title: string; misses: number }[];
  reading: { skill: string; misses: number; firstRepair: string }[];
  repairPath: RepairStep[];
}

/** §70 — one part of a phase exam is one kind of work, with its own instruction and clock. */
export interface ExamItem {
  slug: string;
  stem: string;
  body: string;
  difficulty: number;
  category: string;
  levelKey: string;
  topicSlug: string;
  conceptCount: number;
}

export interface ExamPartPaper {
  key: string;
  label: string;
  position: number;
  minutes: number;
  instructions: string;
  short: boolean;
  items: ExamItem[];
}

export interface ExamSession {
  sessionId: string;
  phaseKey: string;
  phaseTitle: string;
  plannedMinutes: number;
  shortParts: string[];
  parts: ExamPartPaper[];
}

export interface ExamPartScore {
  key: string;
  label: string;
  items: number;
  answered: number;
  score: number;
  passed: boolean;
}

export interface ExamReport {
  sessionId: string;
  phaseKey: string;
  passed: boolean;
  score: number;
  parts: ExamPartScore[];
  failedParts: { key: string; label: string; score: number }[];
  verdicts: { slug: string; part: string; verdict: string; score: number; missing: string[] }[];
  promotions: { topicSlug: string; levelKey: string; previousLevel: number; level: number }[];
  nextPhase: { key: string; title: string } | null;
}
