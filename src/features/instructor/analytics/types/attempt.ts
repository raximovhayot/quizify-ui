/**
 * Backend attempt summary response (from /instructor/assignments/:id/attempts)
 */
export interface InstructorAttemptSummary {
  attemptId: number;
  studentId: number;
  studentName: string;
  attemptNumber: number;
  status: string; // "IN_PROGRESS" | "SUBMITTED" | "GRADED"
  startedAt: string;
  completedAt: string | null;
  durationSeconds: number | null;
  score: number | null;
  completed: boolean;
}

/**
 * Filter for fetching attempts from backend
 */
export interface InstructorAttemptFilter {
  status?: string;
  studentId?: number;
  startedFrom?: string;
  startedTo?: string;
  attemptNumber?: number;
  minScore?: number;
  maxScore?: number;
  page?: number;
  size?: number;
  sort?: string;
}
