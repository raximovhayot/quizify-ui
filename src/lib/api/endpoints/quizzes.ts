import { apiClient } from '../client';
import type { PaginatedResponse } from '../types';

// Quiz types (using existing types from the codebase)
export interface Quiz {
  id: number;
  title: string;
  description?: string;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: string;
  updatedAt: string;
  questionsCount?: number;
}

export interface QuizCreateRequest {
  title: string;
  description?: string;
  status?: 'DRAFT' | 'PUBLISHED';
}

export interface QuizUpdateRequest {
  title?: string;
  description?: string;
  status?: 'DRAFT' | 'PUBLISHED';
}

export interface QuizListParams {
  page?: number;
  size?: number;
  search?: string;
  status?: 'DRAFT' | 'PUBLISHED';
}

export const quizzesApi = {
  getAll: (params?: QuizListParams) =>
    apiClient.get<PaginatedResponse<Quiz>>('/instructor/quizzes', { params }),
  
  getById: (id: number) =>
    apiClient.get<Quiz>(`/instructor/quizzes/${id}`),
  
  create: (data: QuizCreateRequest) =>
    apiClient.post<Quiz>('/instructor/quizzes', data),
  
  update: (id: number, data: QuizUpdateRequest) =>
    apiClient.put<Quiz>(`/instructor/quizzes/${id}`, data),
  
  updateStatus: (id: number, status: 'DRAFT' | 'PUBLISHED') =>
    apiClient.patch<Quiz>(`/instructor/quizzes/${id}/status`, { status }),
  
  delete: (id: number) =>
    apiClient.delete(`/instructor/quizzes/${id}`),
};
