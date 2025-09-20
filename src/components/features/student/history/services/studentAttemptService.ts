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
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (typeof params?.page !== 'undefined')
      query.set('page', String(params.page));
    if (typeof params?.size !== 'undefined')
      query.set('size', String(params.size));

    const url = `/student/attempts/history${query.toString() ? `?${query.toString()}` : ''}`;
    const response: IApiResponse<IPageableList<StudentAttemptDTO>> =
      await apiClient.get(url, accessToken, signal);
    return extractApiData(response);
  }
}
