import { apiClient } from '../client';
import type { PaginatedResponse } from '../types';

export interface Assignment {
  id: number;
  quizId: number;
  quizTitle: string;
  startTime: string;
  endTime: string;
  status: 'PUBLISHED' | 'STARTED' | 'FINISHED';
  createdAt: string;
}

export interface AssignmentCreateRequest {
  quizId: number;
  startTime: string;
  endTime: string;
}

export interface AssignmentListParams {
  page?: number;
  size?: number;
  status?: 'PUBLISHED' | 'STARTED' | 'FINISHED';
}

export interface AssignmentAnalytics {
  assignmentId: number;
  totalStudents: number;
  completedAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
}

export const assignmentsApi = {
  // Instructor endpoints
  getAll: (params?: AssignmentListParams) =>
    apiClient.get<PaginatedResponse<Assignment>>('/instructor/assignments', { params }),
  
  getById: (id: number) =>
    apiClient.get<Assignment>(`/instructor/assignments/${id}`),
  
  create: (data: AssignmentCreateRequest) =>
    apiClient.post<Assignment>('/instructor/assignments', data),
  
  delete: (id: number) =>
    apiClient.delete(`/instructor/assignments/${id}`),
  
  getAnalytics: (assignmentId: number) =>
    apiClient.get<AssignmentAnalytics>(`/instructor/assignments/${assignmentId}/analytics`),
  
  // Student endpoints
  getStudentAssignments: (params?: AssignmentListParams) =>
    apiClient.get<PaginatedResponse<Assignment>>('/student/assignments', { params }),
  
  getStudentAssignment: (id: number) =>
    apiClient.get<Assignment>(`/student/assignments/${id}`),
};
