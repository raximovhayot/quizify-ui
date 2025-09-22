import { studentAttemptPageSchema } from '@/components/features/student/history/schemas/attemptSchema';
import {
  AttemptListingData,
  AttemptStatus,
} from '@/components/features/student/quiz/types/attempt';
import { apiClient } from '@/lib/api';
import { IApiResponse, extractApiData } from '@/types/api';
import { IPageableList } from '@/types/common';

/**
 * StudentAttemptService - Handles student attempts related endpoints
 * - Performs runtime validation and returns typed domain data
 */
export class StudentAttemptService {
  static async getAttempts(
    signal?: AbortSignal,
    params?: { status?: AttemptStatus; page?: number; size?: number }
  ): Promise<IPageableList<AttemptListingData>> {
    const response: IApiResponse<IPageableList<AttemptListingData>> =
      await apiClient.get<IPageableList<AttemptListingData>>(
        '/student/assignments/attempts',
        {
          signal,
          query: {
            status: params?.status,
            page: params?.page,
            size: params?.size,
          },
        }
      );

    const data = extractApiData(response);
    return studentAttemptPageSchema.parse(data);
  }
}
