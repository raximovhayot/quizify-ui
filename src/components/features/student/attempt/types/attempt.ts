import { QuestionDataDto } from '@/components/features/instructor/quiz/types/question';

/**
 * Attempt status enum
 */
export enum AttemptStatus {
  CREATED = 'CREATED',
  STARTED = 'STARTED',
  FINISHED = 'FINISHED',
}

/**
 * Assignment attempt data from backend
 */
export interface AttemptData {
  id: number;
  assignmentId: number;
  studentId: number;
  status: AttemptStatus;
  startedAt?: string;
  finishedAt?: string;
  score?: number;
  totalQuestions: number;
  answeredQuestions: number;
  timeRemaining?: number; // in seconds
}

/**
 * Question with student's answer
 */
export interface AttemptQuestion extends QuestionDataDto {
  attemptAnswerId?: number;
  studentAnswer?: unknown; // Will be typed based on question type
  isAnswered: boolean;
  isFlagged?: boolean;
}

/**
 * Answer submission request
 */
export interface SubmitAnswerRequest {
  questionId: number;
  answer: unknown; // Type depends on question type
}

/**
 * Attempt result data
 */
export interface AttemptResult {
  id: number;
  assignmentId: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  timeSpent: number; // in seconds
  finishedAt: string;
  canViewAnswers: boolean;
  canViewCorrectAnswers: boolean;
}

/**
 * Question result with feedback
 */
export interface QuestionResult {
  questionId: number;
  question: QuestionDataDto;
  studentAnswer?: unknown;
  correctAnswer?: unknown;
  isCorrect: boolean;
  score: number;
  maxScore: number;
  feedback?: string;
}
