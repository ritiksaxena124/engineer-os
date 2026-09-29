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
