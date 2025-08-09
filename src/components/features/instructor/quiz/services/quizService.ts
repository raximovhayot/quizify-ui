import { apiClient } from '@/lib/api';
import { IApiResponse, extractApiData } from '@/types/api';
import { IPageableList } from '@/types/common';

import {
  FullQuizDataDTO,
  InstructorQuizCreateRequest,
  InstructorQuizUpdateRequest,
  InstructorQuizUpdateStatusRequest,
  QuizDataDTO,
  QuizFilter,
  QuizSettings,
} from '../types/quiz';

/**
 * QuizService - Handles quiz-related operations for instructors
 *
 * This service provides methods for managing quizzes including
 * CRUD operations, status updates, and attachment handling.
 */
export class QuizService {
  // ============================================================================
  // QUIZ MANAGEMENT METHODS
  // ============================================================================

  /**
   * Get paginated list of quizzes with optional filtering
   *
   * @param filter - Filter parameters for quiz search
   * @param accessToken - JWT access token for authentication
   * @returns Promise resolving to paginated quiz list
   * @throws BackendError if request fails
   */
  static async getQuizzes(
    filter: QuizFilter = {},
    accessToken: string,
    signal?: AbortSignal
  ): Promise<IPageableList<QuizDataDTO>> {
    const queryParams = new URLSearchParams();

    if (filter.page !== undefined) {
      queryParams.append('page', filter.page.toString());
    }
    if (filter.size !== undefined) {
      queryParams.append('size', filter.size.toString());
    }
    if (filter.search) {
      queryParams.append('search', filter.search);
    }
    if (filter.status) {
      queryParams.append('status', filter.status);
    }

    const endpoint = `/instructor/quizzes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response: IApiResponse<IPageableList<QuizDataDTO>> =
      await apiClient.get(endpoint, accessToken, signal);
    return extractApiData(response);
  }

  /**
   * Get current instructor's quizzes ("myquizzes") with optional filtering
   * Mirrors getQuizzes but targets the myquizzes endpoint in InstructorQuizController
   */
  static async getMyQuizzes(
    filter: QuizFilter = {},
    accessToken: string,
    signal?: AbortSignal
  ): Promise<IPageableList<QuizDataDTO>> {
    const queryParams = new URLSearchParams();

    if (filter.page !== undefined) {
      queryParams.append('page', filter.page.toString());
    }
    if (filter.size !== undefined) {
      queryParams.append('size', filter.size.toString());
    }
    if (filter.search) {
      queryParams.append('search', filter.search);
    }
    if (filter.status) {
      queryParams.append('status', filter.status);
    }

    const endpoint = `/instructor/quizzes/myquizzes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response: IApiResponse<IPageableList<QuizDataDTO>> =
      await apiClient.get(endpoint, accessToken, signal);
    return extractApiData(response);
  }

  /**
   * Get detailed quiz information by ID
   *
   * @param quizId - ID of the quiz to retrieve
   * @param accessToken - JWT access token for authentication
   * @returns Promise resolving to detailed quiz information
   * @throws BackendError if quiz not found
   */
  static async getQuiz(
    quizId: number,
    accessToken: string,
    signal?: AbortSignal
  ): Promise<FullQuizDataDTO> {
    const response: IApiResponse<FullQuizDataDTO> = await apiClient.get(
      `/instructor/quizzes/${quizId}`,
      accessToken,
      signal
    );
    return extractApiData(response);
  }

  /**
   * Create a new quiz
   *
   * @param data - Quiz creation data
   * @param accessToken - JWT access token for authentication
   * @returns Promise resolving to created quiz information
   * @throws BackendError if creation fails or validation errors occur
   */
  static async createQuiz(
    data: InstructorQuizCreateRequest,
    accessToken: string
  ): Promise<FullQuizDataDTO> {
    const response: IApiResponse<FullQuizDataDTO> = await apiClient.post(
      '/instructor/quizzes',
      data,
      accessToken
    );
    return extractApiData(response);
  }

  /**
   * Update an existing quiz
   *
   * @param quizId - ID of the quiz to update
   * @param data - Quiz update data
   * @param accessToken - JWT access token for authentication
   * @returns Promise resolving to updated quiz information
   * @throws BackendError if update fails or quiz not found
   */
  static async updateQuiz(
    quizId: number,
    data: InstructorQuizUpdateRequest,
    accessToken: string
  ): Promise<FullQuizDataDTO> {
    const response: IApiResponse<FullQuizDataDTO> = await apiClient.put(
      `/instructor/quizzes/${quizId}`,
      data,
      accessToken
    );
    return extractApiData(response);
  }

  /**
   * Update quiz status (publish/unpublish)
   *
   * @param quizId - ID of the quiz to update
   * @param data - Status update data
   * @param accessToken - JWT access token for authentication
   * @returns Promise resolving when status update is complete
   * @throws BackendError if update fails or quiz not found
   */
  static async updateQuizStatus(
    quizId: number,
    data: InstructorQuizUpdateStatusRequest,
    accessToken: string
  ): Promise<void> {
    const response: IApiResponse<void> = await apiClient.patch(
      `/instructor/quizzes/${quizId}/status`,
      data,
      accessToken
    );
    extractApiData(response);
  }

  /**
   * Delete a quiz
   *
   * @param quizId - ID of the quiz to delete
   * @param accessToken - JWT access token for authentication
   * @returns Promise resolving when deletion is complete
   * @throws BackendError if deletion fails or quiz not found
   */
  static async deleteQuiz(quizId: number, accessToken: string): Promise<void> {
    const response: IApiResponse<void> = await apiClient.delete(
      `/instructor/quizzes/${quizId}`,
      accessToken
    );
    extractApiData(response);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Validate quiz data before submission
   *
   * @param data - Quiz data to validate
   * @returns Validation result with error messages if invalid
   */
  static validateQuizData(
    data: Partial<InstructorQuizCreateRequest | InstructorQuizUpdateRequest>
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Title validation
    if (!data.title || data.title.trim().length < 3) {
      errors.push('Title must be at least 3 characters long');
    }
    if (data.title && data.title.length > 512) {
      errors.push('Title must be less than 512 characters');
    }

    // Description validation
    if (data.description && data.description.length > 1024) {
      errors.push('Description must be less than 1024 characters');
    }

    // Settings validation
    if (data.settings) {
      if (data.settings.time !== undefined && data.settings.time < 0) {
        errors.push('Time limit cannot be negative');
      }
      if (data.settings.attempt !== undefined && data.settings.attempt < 0) {
        errors.push('Attempt limit cannot be negative');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Format quiz data for display
   *
   * @param quiz - Quiz data to format
   * @returns Formatted quiz data for UI display
   */
  static formatQuizForDisplay(quiz: QuizDataDTO | FullQuizDataDTO) {
    const created = (quiz as { createdDate?: string }).createdDate;
    const lastModified = (quiz as { lastModifiedDate?: string })
      .lastModifiedDate;
    const settings = (quiz as { settings?: Partial<QuizSettings> }).settings;
    const attachmentId = (quiz as { attachmentId?: number }).attachmentId;

    const formattedCreatedDate = created
      ? new Date(created).toLocaleDateString()
      : undefined;

    const formattedLastModifiedDate = lastModified
      ? new Date(lastModified).toLocaleDateString()
      : undefined;

    let timeDisplay: string | undefined;
    if (typeof settings?.time === 'number') {
      timeDisplay = settings.time === 0 ? 'No limit' : `${settings.time} min`;
    }

    return {
      ...quiz,
      formattedCreatedDate,
      formattedLastModifiedDate,
      hasAttachment: !!attachmentId,
      timeDisplay,
    };
  }
}
