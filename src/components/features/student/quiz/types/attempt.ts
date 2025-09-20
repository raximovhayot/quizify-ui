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
  // Optional fields used by history UI
  quizTitle?: string;
  quizId?: number;
  startedAt?: string; // ISO timestamp
  finishedAt?: string; // ISO timestamp
  score?: number; // percentage or points
}

// Backward-compatible alias expected by various components/services
export type StudentAttemptDTO = AttemptListingData;
