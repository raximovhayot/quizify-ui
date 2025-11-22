import { apiClient } from '../client';
import type { PaginatedResponse } from '../types';

export interface Attempt {
  id: number;
  assignmentId: number;
  studentId: number;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED';
  score?: number;
  startedAt: string;
  submittedAt?: string;
  timeSpent?: number;
}

export interface AttemptContent {
  id: number;
  questions: AttemptQuestion[];
  duration?: number;
}

export interface AttemptQuestion {
  id: number;
  questionId: number;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_IN_BLANK' | 'ESSAY';
  options?: AttemptOption[];
  correctAnswer?: unknown;
  userAnswer?: unknown;
}

export interface AttemptOption {
  id: number;
  text: string;
  isCorrect?: boolean;
}

export interface SubmitAttemptRequest {
  answers: Array<{
    questionId: number;
    answerId?: number | number[];
    answerText?: string;
  }>;
}

export interface AttemptListParams {
  page?: number;
  size?: number;
  status?: 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED';
}

export const attemptsApi = {
  // Student endpoints
  getMyAttempts: (params?: AttemptListParams) =>
    apiClient.get<PaginatedResponse<Attempt>>('/student/attempts', { params }),
  
  getAttemptById: (id: number) =>
    apiClient.get<Attempt>(`/student/attempts/${id}`),
  
  getAttemptContent: (id: number) =>
    apiClient.get<AttemptContent>(`/student/attempts/${id}/content`),
  
  startAttempt: (assignmentId: number) =>
    apiClient.post<Attempt>(`/student/attempts/start/${assignmentId}`),
  
  submitAttempt: (id: number, data: SubmitAttemptRequest) =>
    apiClient.post<Attempt>(`/student/attempts/${id}/submit`, data),
  
  saveProgress: (id: number, data: SubmitAttemptRequest) =>
    apiClient.put<Attempt>(`/student/attempts/${id}/progress`, data),
  
  // Instructor endpoints
  getAssignmentAttempts: (assignmentId: number, params?: AttemptListParams) =>
    apiClient.get<PaginatedResponse<Attempt>>(`/instructor/attempts/assignment/${assignmentId}`, { params }),
  
  getAttemptDetails: (id: number) =>
    apiClient.get<Attempt>(`/instructor/attempts/${id}`),
  
  gradeAttempt: (id: number, score: number) =>
    apiClient.patch<Attempt>(`/instructor/attempts/${id}/grade`, { score }),
};
