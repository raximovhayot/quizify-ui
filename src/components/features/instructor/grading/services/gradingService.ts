import { apiClient } from '@/lib/api';
import { IApiResponse, extractApiData } from '@/types/api';

import { AssignmentGrading, GradeEssayRequest } from '../types/grading';

/**
 * Service for instructor grading operations
 */
export class GradingService {
  /**
   * Get all essay answers needing grading for an assignment
   */
  static async getAssignmentGrading(
    assignmentId: number,
    signal?: AbortSignal
  ): Promise<AssignmentGrading> {
    const response: IApiResponse<AssignmentGrading> = await apiClient.get(
      `/instructor/assignments/:id/grading`,
      {
        signal,
        params: { id: assignmentId },
      }
    );
    return extractApiData(response);
  }

  /**
   * Grade an essay answer
   */
  static async gradeEssay(
    answerId: number,
    grading: GradeEssayRequest,
    signal?: AbortSignal
  ): Promise<void> {
    const response: IApiResponse<void> = await apiClient.request(
      `/instructor/answers/:id/grade`,
      {
        method: 'POST',
        body: grading,
        signal,
        params: { id: answerId },
      }
    );
    extractApiData(response);
  }

  /**
   * Bulk update grading status
   */
  static async markAsGraded(
    answerIds: number[],
    signal?: AbortSignal
  ): Promise<void> {
    const response: IApiResponse<void> = await apiClient.request(
      `/instructor/answers/bulk-grade`,
      { method: 'POST', body: { answerIds }, signal }
    );
    extractApiData(response);
  }
}
