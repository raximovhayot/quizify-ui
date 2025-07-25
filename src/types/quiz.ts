/**
 * Quiz-related TypeScript types based on backend API schemas
 */

export enum QuizStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED'
}

export interface QuizSettings {
  time: number; // Duration in minutes
  attempt: number; // Number of allowed attempts
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
}

export interface BasicQuizDataDTO {
  id: number;
  title: string;
  description: string;
  status: QuizStatus;
  createdDate: string; // ISO date-time string
  numberOfQuestions: number;
  time: number; // Duration in minutes
  attachmentId?: number;
}

export interface InstructorQuizCreateRequest {
  title: string; // 3-512 characters
  description: string; // 0-1024 characters
  settings: QuizSettings;
  attachmentId?: number;
}

export interface InstructorQuizUpdateStatusRequest {
  status: QuizStatus;
}

export interface FullQuizDataDTO extends BasicQuizDataDTO {
  settings: QuizSettings;
  // Additional fields that might be in the full quiz data
}

export interface QuizListParams {
  page?: number;
  size?: number;
  search?: string;
  status?: QuizStatus;
}

export interface PageableResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}