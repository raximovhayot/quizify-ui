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
 * Question result within attempt detail
 */
export interface QuestionResult {
  questionId: number;
  questionType: string;
  content: string;
  correct: boolean | null; // nullable for manual grading before graded
  pointsAwarded: number | null;
  comment: string | null; // grader comment
}

/**
 * Detailed attempt response (from /instructor/assignments/:id/attempts/:attemptId)
 */
export interface InstructorAttemptDetail {
  attemptId: number;
  assignmentId: number;
  quizId: number;
  studentId: number;
  studentName: string;
  attemptNumber: number;
  status: string;
  startedAt: string;
  completedAt: string | null;
  durationSeconds: number | null;
  score: number | null;
  completed: boolean;
  questions: QuestionResult[];
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
