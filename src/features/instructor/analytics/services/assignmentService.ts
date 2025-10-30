import { apiClient } from '@/lib/api';
import { IApiResponse, extractApiData } from '@/types/api';
import { IPageableList } from '@/types/common';

import { studentRegistrationSchema } from '../schemas/analyticsSchema';
import {
  assignmentDataDTOSchema,
  assignmentListResponseSchema,
} from '../schemas/assignmentSchema';
import {
  attemptSummaryListResponseSchema,
  instructorAttemptDetailSchema,
} from '../schemas/attemptSchema';
import { computeAnalyticsFromAttempts } from '../lib/analyticsCompute';
import {
  AssignmentAnalytics,
  StudentRegistration,
} from '../types/analytics';
import {
  AssignmentCreateRequest,
  AssignmentDTO,
  AssignmentFilter,
} from '../types/assignment';
import {
  InstructorAttemptDetail,
  InstructorAttemptFilter,
  InstructorAttemptSummary,
} from '../types/attempt';

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

  // ============================================================================
  // ASSIGNMENT ANALYTICS METHODS
  // ============================================================================

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
   * Get instructor attempt summaries for an assignment
   * Uses backend endpoint: GET /instructor/assignments/:assignmentId/attempts
   *
   * @param assignmentId - ID of the assignment
   * @param filter - Filter parameters for attempts
   * @param signal - AbortSignal for request cancellation
   * @returns Promise resolving to pageable list of attempt summaries
   */
  static async getAttempts(
    assignmentId: number,
    filter: InstructorAttemptFilter = {},
    signal?: AbortSignal
  ): Promise<IPageableList<InstructorAttemptSummary>> {
    const response: IApiResponse<IPageableList<InstructorAttemptSummary>> =
      await apiClient.get(`/instructor/assignments/:assignmentId/attempts`, {
        signal,
        params: { assignmentId },
        query: {
          status: filter.status,
          studentId: filter.studentId,
          startedFrom: filter.startedFrom,
          startedTo: filter.startedTo,
          attemptNumber: filter.attemptNumber,
          minScore: filter.minScore,
          maxScore: filter.maxScore,
          page: filter.page,
          size: filter.size,
          sort: filter.sort,
        },
      });
    const data = extractApiData(response);
    return attemptSummaryListResponseSchema.parse(data);
  }

  /**
   * Get all attempts for an assignment (fetches all pages)
   * Used for computing analytics client-side
   *
   * @param assignmentId - ID of the assignment
   * @param signal - AbortSignal for request cancellation
   * @returns Promise resolving to array of all attempt summaries
   */
  static async getAllAttempts(
    assignmentId: number,
    signal?: AbortSignal
  ): Promise<InstructorAttemptSummary[]> {
    const allAttempts: InstructorAttemptSummary[] = [];
    let page = 0;
    const size = 100; // Fetch in chunks of 100
    let hasMore = true;

    while (hasMore) {
      const pageData = await this.getAttempts(
        assignmentId,
        { page, size },
        signal
      );

      allAttempts.push(...pageData.content);

      // Determine if there are more pages based on totalPages and current page (0-based)
      hasMore = page + 1 < pageData.totalPages;
      page++;

      // Safety check to prevent infinite loops
      if (page > 100) {
        // Reached maximum page limit when fetching attempts
        break;
      }
    }

    return allAttempts;
  }

  /**
   * Get analytics overview for an assignment
   * Computes analytics from attempts fetched from backend
   *
   * @param assignmentId - ID of the assignment
   * @param signal - AbortSignal for request cancellation
   * @returns Promise resolving to assignment analytics data
   */
  static async getAssignmentAnalytics(
    assignmentId: number,
    signal?: AbortSignal
  ): Promise<AssignmentAnalytics> {
    // Fetch assignment details and all attempts in parallel
    const [assignment, attempts] = await Promise.all([
      this.getAssignment(assignmentId, signal),
      this.getAllAttempts(assignmentId, signal),
    ]);

    // Compute analytics from attempts
    return computeAnalyticsFromAttempts(assignment, attempts);
  }


  /**
   * Get detailed attempt information
   * Uses backend endpoint: GET /instructor/assignments/:assignmentId/attempts/:attemptId
   *
   * @param assignmentId - ID of the assignment
   * @param attemptId - ID of the attempt
   * @param signal - AbortSignal for request cancellation
   * @returns Promise resolving to detailed attempt information
   */
  static async getAttemptDetail(
    assignmentId: number,
    attemptId: number,
    signal?: AbortSignal
  ): Promise<InstructorAttemptDetail> {
    const response: IApiResponse<InstructorAttemptDetail> =
      await apiClient.get(
        `/instructor/assignments/:assignmentId/attempts/:attemptId`,
        {
          signal,
          params: { assignmentId, attemptId },
        }
      );
    const data = extractApiData(response);
    return instructorAttemptDetailSchema.parse(data);
  }
}
