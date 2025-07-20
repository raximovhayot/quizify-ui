/**
 * Quiz-related type definitions based on backend-filesystem MCP server
 */

import { QuizStatus, PageableList, SortDto } from './common';

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';

// Question-related types based on backend
export interface QuestionDataDto {
  id: number;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
  order: number;
}

export interface AnswerDataDto {
  id: number;
  answer: string;
  isCorrect: boolean;
  order: number;
}

export interface InstructorQuestionSaveRequest {
  id?: number;
  type: QuestionType;
  question: string;
  answers: InstructionAnswerSaveRequest[];
  points: number;
  order: number;
}

export interface InstructionAnswerSaveRequest {
  id?: number;
  answer: string;
  isCorrect: boolean;
  order: number;
}

// Quiz DTOs based on backend
export interface BasicQuizDataDTO {
  id: number;
  title: string;
  description: string;
  status: QuizStatus;
  createdDate: string;
  updatedDate: string;
  totalQuestions: number;
  totalPoints: number;
}

export interface FullQuizDataDTO extends BasicQuizDataDTO {
  questions: QuestionDataDto[];
  timeLimit?: number;
  maxAttempts?: number;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  showResults: boolean;
  allowReview: boolean;
}

// Quiz request types based on backend
export interface InstructorQuizCreateRequest {
  title: string;
  description: string;
  timeLimit?: number;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  shuffleAnswers?: boolean;
  showResults?: boolean;
  allowReview?: boolean;
}

export interface InstructorQuizUpdateRequest {
  id: number;
  title?: string;
  description?: string;
  timeLimit?: number;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  shuffleAnswers?: boolean;
  showResults?: boolean;
  allowReview?: boolean;
}

export interface InstructorQuizUpdateStatusRequest {
  id: number;
  status: QuizStatus;
}

// Quiz filtering and pagination
export interface QuizFilter {
  page: number;
  size: number;
  search?: string;
  status?: QuizStatus;
  sorts: SortDto[];
}

// Quiz attempt types
export interface QuizAttemptAnswer {
  questionId: number;
  answer: string;
  isCorrect?: boolean;
  pointsEarned?: number;
}

export interface QuizAttempt {
  id: number;
  quizId: number;
  assignmentId: number;
  studentId: number;
  answers: QuizAttemptAnswer[];
  score: number;
  totalPoints: number;
  percentage: number;
  timeSpent: number; // in seconds
  startedAt: string;
  completedAt?: string;
  status: 'in_progress' | 'completed' | 'abandoned';
}

export interface StartQuizAttemptRequest {
  assignmentId: number;
}

export interface StartQuizAttemptResponse {
  attemptId: number;
  quiz: Omit<FullQuizDataDTO, 'questions'> & {
    questions: Omit<QuestionDataDto, 'correctAnswer'>[];
  };
  timeLimit?: number;
  startedAt: string;
}

export interface SubmitQuizAttemptRequest {
  attemptId: number;
  answers: {
    questionId: number;
    answer: string;
  }[];
}

export interface SubmitQuizAttemptResponse {
  attempt: QuizAttempt;
  passed: boolean;
  message: string;
}

// Response types for quiz APIs
export type QuizListResponse = PageableList<BasicQuizDataDTO>;
export type QuizDetailsResponse = FullQuizDataDTO;

// Legacy types for backward compatibility
export type Quiz = FullQuizDataDTO;
export type QuizQuestion = QuestionDataDto;
export type CreateQuizRequest = InstructorQuizCreateRequest;
export type UpdateQuizRequest = InstructorQuizUpdateRequest;