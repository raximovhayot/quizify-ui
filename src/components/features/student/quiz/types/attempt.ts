export interface StudentAttemptDTO {
  id: number;
  quizId: number;
  quizTitle: string;
  startedAt?: string; // ISO date-time
  finishedAt?: string; // ISO date-time
  score?: number; // 0-100 or raw score depending on backend
  status?: 'passed' | 'failed' | 'in_progress' | 'completed' | string;
}
