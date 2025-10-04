import { z } from 'zod';

import { pageableSchema } from '@/components/shared/schemas/pageable.schema';
import { apiClient } from '@/lib/api';
import { IApiResponse, extractApiData } from '@/types/api';
import { IPageableList } from '@/types/common';

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
    // validate pageable list generically (content left as unknown here)
    const parsed = pageableSchema(z.unknown()).passthrough().parse(data);
    return parsed as unknown as IPageableList<AssignmentDTO>;
  }

  /**
   * Create a new assignment
   *
   * @param request - Assignment creation data
   * @param signal - AbortSignal for request cancellation
   * @returns Promise resolving to created assignment information
   * @throws BackendError if creation fails or validation errors occur
   */
  static async createAssignment(
    request: AssignmentCreateRequest,
    signal?: AbortSignal
  ): Promise<AssignmentDTO> {
    const response: IApiResponse<AssignmentDTO> = await apiClient.post(
      '/instructor/assignments',
      request
    );
    return extractApiData(response);
  }
}
