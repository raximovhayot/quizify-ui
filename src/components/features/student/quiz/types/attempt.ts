export enum AttemptStatus {
  CREATED,
  STARTED,
  FINISHED,
}

export interface AttemptListingData {
  id: number;
  title: string;
  attempt: number; // which attempt is this
  status: AttemptStatus | string;
  correct: number;
  incorrect: number;
  notChosen: number;
  total: number;
  // Optional fields used by history UI (nullable to match backend)
  quizTitle?: string | null;
  quizId?: number | null;
  startedAt?: string | null; // ISO timestamp
  finishedAt?: string | null; // ISO timestamp
  score?: number | null; // percentage or points
}

// Backward-compatible alias expected by various components/services
export type StudentAttemptDTO = AttemptListingData;
