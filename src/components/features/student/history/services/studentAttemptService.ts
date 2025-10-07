import { pageableAttemptListSchema, attemptFullDataSchema, attemptSaveStateRequestSchema, type AttemptFullData, type AttemptSaveStateRequest } from '@/components/features/student/history/schemas/attemptSchema';
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
    return pageableAttemptListSchema.parseAsync(data);
  }

  static async getContent(
    attemptId: number,
    signal?: AbortSignal
  ): Promise<AttemptFullData> {
    const response: IApiResponse<unknown> = await apiClient.get(
      '/student/assignments/attempts/:attemptId/content',
      { signal, params: { attemptId } }
    );
    const data = extractApiData(response);
    return attemptFullDataSchema.parse(data);
  }

  static async saveState(
    request: AttemptSaveStateRequest,
    signal?: AbortSignal
  ): Promise<number> {
    // Validate outgoing payload
    const body = attemptSaveStateRequestSchema.parse(request);
    const response: IApiResponse<number> = await apiClient.post(
      '/student/assignments/attempts/save-state',
      body,
      { signal }
    );
    const data = extractApiData(response);
    return Number(data);
  }

  static async complete(
    attemptId: number,
    signal?: AbortSignal
  ): Promise<number> {
    const response: IApiResponse<number> = await apiClient.request(
      '/student/assignments/attempts/:attemptId/complete',
      { method: 'POST', params: { attemptId }, signal }
    );
    const data = extractApiData(response);
    return Number(data);
  }
}
