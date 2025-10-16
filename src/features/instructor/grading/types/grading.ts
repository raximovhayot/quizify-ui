/**
 * Essay answer to be graded
 */
export interface EssayAnswer {
  answerId: number;
  attemptId: number;
  questionId: number;
  questionText: string;
  questionPoints: number;
  gradingCriteria: string | null;
  studentAnswer: string;
  studentId: number;
  studentName: string;
  studentEmail: string;
  currentScore: number | null;
  currentFeedback: string | null;
  status: 'PENDING' | 'GRADED';
  submittedAt: string;
}

/**
 * Grading request for an essay answer
 */
export interface GradeEssayRequest {
  score: number;
  feedback?: string;
}

/**
 * Assignment grading overview
 */
export interface AssignmentGrading {
  assignmentId: number;
  assignmentTitle: string;
  totalEssayQuestions: number;
  totalEssayAnswers: number;
  pendingGrading: number;
  gradedCount: number;
  essayAnswers: EssayAnswer[];
}
