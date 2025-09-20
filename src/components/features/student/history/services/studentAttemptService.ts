import { StudentAttemptDTO } from '@/components/features/student/quiz/types/attempt';
import { apiClient } from '@/lib/api';
import { IApiResponse, extractApiData } from '@/types/api';
import { IPageableList } from '@/types/common';

/**
 * StudentAttemptService - Handles student attempts related endpoints
 */
export class StudentAttemptService {
  /**
   * Get student's attempt history (paginated)
   */
  static async getAttemptHistory(
    accessToken?: string,
    signal?: AbortSignal,
    params?: { status?: string; page?: number; size?: number }
  ): Promise<IPageableList<StudentAttemptDTO>> {
    const response: IApiResponse<IPageableList<StudentAttemptDTO>> =
      await apiClient.get(`/student/attempts/history`, {
        token: accessToken!,
        signal,
        query: {
          status: params?.status,
          page: params?.page,
          size: params?.size,
        },
      });
    return extractApiData(response);
  }
}
