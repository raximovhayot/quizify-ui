import { apiClient } from '@/lib/api';
import { IApiResponse, extractApiData } from '@/types/api';
import { IPageableList } from '@/types/common';

import {
  assignmentAnalyticsSchema,
  questionAnalyticsSchema,
  studentRegistrationSchema,
} from '../schemas/analyticsSchema';
import {
  assignmentDataDTOSchema,
  assignmentListResponseSchema,
} from '../schemas/assignmentSchema';
import {
  AssignmentAnalytics,
  QuestionAnalytics,
  StudentRegistration,
} from '../types/analytics';
import {
  AssignmentCreateRequest,
  AssignmentDTO,
  AssignmentFilter,
} from '../types/assignment';

/**
 * AssignmentService - Handles assignment-related operations for instructors
 *
 * This service provides methods for managing assignments including
 * CRUD operations and filtering.
 */
export class AssignmentService {
  // ============================================================================
  // ASSIGNMENT MANAGEMENT METHODS
  // ============================================================================

  /**
   * Get paginated list of assignments with optional filtering
   *
   * @param filter - Filter parameters for assignment search
   * @param signal - AbortSignal for request cancellation
   * @returns Promise resolving to paginated assignment list
   * @throws BackendError if request fails
   */
  static async getAssignments(
    filter: AssignmentFilter = {},
    signal?: AbortSignal
  ): Promise<IPageableList<AssignmentDTO>> {
    const response: IApiResponse<IPageableList<AssignmentDTO>> =
      await apiClient.get('/instructor/assignments', {
        signal,
        query: {
          page: filter.page,
          size: filter.size,
          search: filter.search,
          status: filter.status,
        },
      });
    const data = extractApiData(response);
    return assignmentListResponseSchema.parse(data);
  }

  /**
   * Get detailed assignment information by ID
   *
   * @param id - ID of the assignment to retrieve
   * @param signal - AbortSignal for request cancellation
   * @returns Promise resolving to detailed assignment information
   * @throws BackendError if assignment not found
   */
  static async getAssignment(
    id: number,
    signal?: AbortSignal
  ): Promise<AssignmentDTO> {
    const response: IApiResponse<AssignmentDTO> = await apiClient.get(
      `/instructor/assignments/:id`,
      { signal, params: { id } }
    );
    const data = extractApiData(response);
    return assignmentDataDTOSchema.parse(data);
  }

  /**
   * Create a new assignment
   *
   * @param request - Assignment creation data
   * @returns Promise resolving to created assignment information
   * @throws BackendError if creation fails or validation errors occur
   */
  static async createAssignment(
    request: AssignmentCreateRequest
  ): Promise<AssignmentDTO> {
    const response: IApiResponse<AssignmentDTO> = await apiClient.post(
      '/instructor/assignments',
      request
    );
    const data = extractApiData(response);
    return assignmentDataDTOSchema.parse(data);
  }

  /**
   * Update an existing assignment
   *
   * @param id - Assignment ID
   * @param request - Partial assignment fields to update
   */
  static async updateAssignment(
    id: number,
    request: Partial<AssignmentDTO>
  ): Promise<AssignmentDTO> {
    const response: IApiResponse<AssignmentDTO> = await apiClient.put(
      '/instructor/assignments/:id',
      request,
      { params: { id } }
    );
    const data = extractApiData(response);
    return assignmentDataDTOSchema.parse(data);
  }

  /**
   * Delete an assignment by ID
   */
  static async deleteAssignment(id: number): Promise<void> {
    const response: IApiResponse<void> = await apiClient.delete(
      '/instructor/assignments/:id',
      { params: { id } }
    );
    extractApiData(response);
  }

  // ============================================================================
  // ASSIGNMENT ANALYTICS METHODS
  // ============================================================================

  /**
   * Get analytics overview for an assignment
   *
   * @param assignmentId - ID of the assignment
   * @param signal - AbortSignal for request cancellation
   * @returns Promise resolving to assignment analytics data
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
   *
   * @param assignmentId - ID of the assignment
   * @param signal - AbortSignal for request cancellation
   * @returns Promise resolving to question analytics array
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
   *
   * @param assignmentId - ID of the assignment
   * @param signal - AbortSignal for request cancellation
   * @returns Promise resolving to student registrations array
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
   * Export assignment analytics to Excel
   *
   * @param assignmentId - ID of the assignment
   * @param signal - AbortSignal for request cancellation
   * @returns Promise resolving to Excel file blob
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
