import { apiClient } from '@/lib/api';
import { IApiResponse, extractApiData } from '@/types/api';

import {
  AssignmentAnalytics,
  QuestionAnalytics,
  StudentRegistration,
} from '../types/analytics';

/**
 * Service for instructor analytics operations
 */
export class AnalyticsService {
  /**
   * Get analytics overview for an assignment
   */
  static async getAssignmentAnalytics(
    assignmentId: number,
    signal?: AbortSignal
  ): Promise<AssignmentAnalytics> {
    const response: IApiResponse<AssignmentAnalytics> = await apiClient.get(
      `/instructor/assignments/:id/analytics`,
      {
        signal,
        params: { id: assignmentId },
      }
    );
    return extractApiData(response);
  }

  /**
   * Get question-level analytics for an assignment
   */
  static async getQuestionAnalytics(
    assignmentId: number,
    signal?: AbortSignal
  ): Promise<QuestionAnalytics[]> {
    const response: IApiResponse<QuestionAnalytics[]> = await apiClient.get(
      `/instructor/assignments/:id/questions/analytics`,
      {
        signal,
        params: { id: assignmentId },
      }
    );
    return extractApiData(response);
  }

  /**
   * Get student registrations for an assignment
   */
  static async getStudentRegistrations(
    assignmentId: number,
    signal?: AbortSignal
  ): Promise<StudentRegistration[]> {
    const response: IApiResponse<StudentRegistration[]> = await apiClient.get(
      `/instructor/assignments/:id/registrations`,
      {
        signal,
        params: { id: assignmentId },
      }
    );
    return extractApiData(response);
  }

  /**
   * Export assignment analytics to CSV
   */
  static async exportAnalytics(
    assignmentId: number,
    signal?: AbortSignal
  ): Promise<Blob> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/instructor/assignments/${assignmentId}/analytics/export`,
      {
        method: 'GET',
        signal,
        headers: {
          Accept: 'text/csv',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to export analytics');
    }

    return await response.blob();
  }
}
