import { apiClient } from '@/lib/api';
import { IApiResponse, extractApiData } from '@/types/api';
import { IPageableList } from '@/types/common';

import {
  assignmentRegistrationSchema,
  checkJoinResponseSchema,
  joinAssignmentResponseSchema,
} from '../schemas/registrationSchema';
import {
  AssignmentRegistration,
  CheckJoinRequest,
  CheckJoinResponse,
  JoinAssignmentRequest,
  JoinAssignmentResponse,
} from '../types/registration';

/**
 * StudentAssignmentService - Handles student assignment registration operations
 */
export class StudentAssignmentService {
  /**
   * Join an assignment with a code
   */
  static async joinWithCode(
    request: JoinAssignmentRequest,
    accessToken: string,
    signal?: AbortSignal
  ): Promise<JoinAssignmentResponse> {
    const response: IApiResponse<JoinAssignmentResponse> = await apiClient.post(
      '/student/assignments/join',
      request,
      {
        token: accessToken,
      }
    );
    const data = extractApiData(response);
    return joinAssignmentResponseSchema.parse(data);
  }

  /**
   * Check if can join assignment with code (preview before joining)
   */
  static async checkJoin(
    request: CheckJoinRequest,
    accessToken: string,
    signal?: AbortSignal
  ): Promise<CheckJoinResponse> {
    const response: IApiResponse<CheckJoinResponse> = await apiClient.post(
      '/student/assignments/check-join',
      request,
      {
        token: accessToken,
      }
    );
    const data = extractApiData(response);
    return checkJoinResponseSchema.parse(data);
  }

  /**
   * Get all registrations for the current student
   */
  static async getRegistrations(
    accessToken: string,
    params?: { page?: number; size?: number; status?: string },
    signal?: AbortSignal
  ): Promise<IPageableList<AssignmentRegistration>> {
    const response: IApiResponse<IPageableList<AssignmentRegistration>> =
      await apiClient.get('/student/assignments/registrations', {
        token: accessToken,
        query: {
          page: params?.page,
          size: params?.size,
          status: params?.status,
        },
      });
    const data = extractApiData(response);

    // Validate pageable structure
    return {
      content:
        data.content?.map((item: unknown) =>
          assignmentRegistrationSchema.parse(item)
        ) || [],
      totalElements: data.totalElements ?? 0,
      totalPages: data.totalPages ?? 0,
      size: data.size ?? 10,
      page: data.page ?? (data as { number?: number }).number ?? 0,
    };
  }

  /**
   * Register for a specific assignment by ID
   */
  static async registerForAssignment(
    assignmentId: number,
    accessToken: string,
    signal?: AbortSignal
  ): Promise<void> {
    await apiClient.post(
      '/student/assignments/:id/register',
      {},
      {
        token: accessToken,
        params: { id: assignmentId },
      }
    );
  }

  /**
   * Unregister from an assignment
   */
  static async unregisterFromAssignment(
    assignmentId: number,
    accessToken: string,
    signal?: AbortSignal
  ): Promise<void> {
    await apiClient.delete('/student/assignments/:id/register', {
      token: accessToken,
      params: { id: assignmentId },
    });
  }
}
