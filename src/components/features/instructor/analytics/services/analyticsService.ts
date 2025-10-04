import { env } from '@/env.mjs';
import { apiClient } from '@/lib/api';
import { IApiResponse, extractApiData } from '@/types/api';

import {
  assignmentAnalyticsSchema,
  questionAnalyticsSchema,
  studentRegistrationSchema,
} from '../schemas/analyticsSchema';
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
    const data = extractApiData(response);
    return assignmentAnalyticsSchema.parse(data);
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
    const data = extractApiData(response);
    return questionAnalyticsSchema.array().parse(data);
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
    const data = extractApiData(response);
    return studentRegistrationSchema.array().parse(data);
  }

  /**
   * Export assignment analytics to CSV
   */
  static async exportAnalytics(
    assignmentId: number,
    signal?: AbortSignal
  ): Promise<Blob> {
    // Use apiClient to ensure auth headers and consistent error handling.
    // Expect Excel output from backend.
    const excelMime =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const res = await apiClient.request<Blob>(
      `/instructor/assignments/:id/analytics/export`,
      {
        method: 'GET',
        parseAs: 'blob',
        params: { id: assignmentId },
        signal,
        headers: {
          Accept: excelMime,
        },
      }
    );

    if (res.errors?.length) {
      throw new Error(res.errors[0]?.message || 'Failed to export analytics');
    }

    return res.data;
  }
}
