import { apiClient } from '../client';

export interface Question {
  id: number;
  quizId: number;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_IN_BLANK' | 'ESSAY';
  order: number;
  points: number;
  options?: QuestionOption[];
}

export interface QuestionOption {
  id: number;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface QuestionCreateRequest {
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_IN_BLANK' | 'ESSAY';
  points: number;
  options?: Array<{
    text: string;
    isCorrect: boolean;
  }>;
}

export interface QuestionUpdateRequest {
  questionText?: string;
  points?: number;
  options?: Array<{
    id?: number;
    text: string;
    isCorrect: boolean;
  }>;
}

export const questionsApi = {
  getAll: (quizId: number) =>
    apiClient.get<Question[]>(`/instructor/quizzes/${quizId}/questions`),
  
  getById: (quizId: number, questionId: number) =>
    apiClient.get<Question>(`/instructor/quizzes/${quizId}/questions/${questionId}`),
  
  create: (quizId: number, data: QuestionCreateRequest) =>
    apiClient.post<Question>(`/instructor/quizzes/${quizId}/questions`, data),
  
  update: (quizId: number, questionId: number, data: QuestionUpdateRequest) =>
    apiClient.put<Question>(`/instructor/quizzes/${quizId}/questions/${questionId}`, data),
  
  delete: (quizId: number, questionId: number) =>
    apiClient.delete(`/instructor/quizzes/${quizId}/questions/${questionId}`),
  
  reorder: (quizId: number, questionIds: number[]) =>
    apiClient.put(`/instructor/quizzes/${quizId}/questions/reorder`, { questionIds }),
};
