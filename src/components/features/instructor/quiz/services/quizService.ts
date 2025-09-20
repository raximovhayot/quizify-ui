import { apiClient } from '@/lib/api';
import { IApiResponse, extractApiData } from '@/types/api';
import { IPageableList } from '@/types/common';

import {
  InstructorQuizCreateRequest,
  InstructorQuizUpdateRequest,
  InstructorQuizUpdateStatusRequest,
  QuizDataDTO,
  QuizFilter,
} from '../types/quiz';

/**
 * QuizService - Handles quiz-related operations for instructors
 *
 * This services provides methods for managing quizzes including
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
    const response: IApiResponse<IPageableList<QuizDataDTO>> =
      await apiClient.get('/instructor/quizzes', {
        token: accessToken,
        signal,
        query: {
          page: filter.page,
          size: filter.size,
          search: filter.search,
          status: filter.status,
        },
      });
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
  ): Promise<QuizDataDTO> {
    const response: IApiResponse<QuizDataDTO> = await apiClient.get(
      `/instructor/quizzes/:id`,
      { token: accessToken, signal, params: { id: quizId } }
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
  ): Promise<QuizDataDTO> {
    const response: IApiResponse<QuizDataDTO> = await apiClient.post(
      '/instructor/quizzes',
      data,
      { token: accessToken }
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
  ): Promise<QuizDataDTO> {
    const response: IApiResponse<QuizDataDTO> = await apiClient.put(
      `/instructor/quizzes/:id`,
      data,
      { token: accessToken, params: { id: quizId } }
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
      `/instructor/quizzes/:id/status`,
      data,
      { token: accessToken, params: { id: quizId } }
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
      `/instructor/quizzes/:id`,
      { token: accessToken, params: { id: quizId } }
    );
    extractApiData(response);
  }
}
