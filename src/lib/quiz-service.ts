import { apiClient } from './api';
import { 
  BasicQuizDataDTO,
  FullQuizDataDTO,
  InstructorQuizCreateRequest,
  InstructorQuizUpdateStatusRequest,
  QuizListParams,
  PageableResponse,
  QuizStatus
} from '@/types/quiz';
import { extractApiData } from '@/types/api';

/**
 * Service class for instructor quiz management operations
 */
class QuizService {
  private readonly baseEndpoint = '/instructor/quizzes';

  /**
   * Get list of instructor's quizzes with pagination and filtering
   */
  async getQuizzes(
    params: QuizListParams = {},
    accessToken: string
  ): Promise<PageableResponse<BasicQuizDataDTO>> {
    const queryParams = new URLSearchParams();
    
    if (params.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    if (params.size !== undefined) {
      queryParams.append('size', params.size.toString());
    }
    if (params.search) {
      queryParams.append('search', params.search);
    }
    if (params.status) {
      queryParams.append('status', params.status);
    }

    const endpoint = `${this.baseEndpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get<PageableResponse<BasicQuizDataDTO>>(endpoint, accessToken);
    
    return extractApiData(response);
  }

  /**
   * Get detailed quiz data by ID
   */
  async getQuizById(
    quizId: number,
    accessToken: string
  ): Promise<FullQuizDataDTO> {
    const endpoint = `${this.baseEndpoint}/${quizId}`;
    const response = await apiClient.get<FullQuizDataDTO>(endpoint, accessToken);
    
    return extractApiData(response);
  }

  /**
   * Create a new quiz
   */
  async createQuiz(
    quizData: InstructorQuizCreateRequest,
    accessToken: string
  ): Promise<BasicQuizDataDTO> {
    const response = await apiClient.post<BasicQuizDataDTO>(
      this.baseEndpoint,
      quizData,
      accessToken
    );
    
    return extractApiData(response);
  }

  /**
   * Update quiz status (publish/unpublish)
   */
  async updateQuizStatus(
    quizId: number,
    status: QuizStatus,
    accessToken: string
  ): Promise<BasicQuizDataDTO> {
    const endpoint = `${this.baseEndpoint}/${quizId}/status`;
    const requestData: InstructorQuizUpdateStatusRequest = { status };
    
    const response = await apiClient.patch<BasicQuizDataDTO>(
      endpoint,
      requestData,
      accessToken
    );
    
    return extractApiData(response);
  }

  /**
   * Delete a quiz
   */
  async deleteQuiz(
    quizId: number,
    accessToken: string
  ): Promise<void> {
    const endpoint = `${this.baseEndpoint}/${quizId}`;
    const response = await apiClient.delete<void>(endpoint, accessToken);
    
    extractApiData(response);
  }

  /**
   * Duplicate a quiz (create a copy)
   * Note: This might need to be implemented by getting the quiz data and creating a new one
   */
  async duplicateQuiz(
    quizId: number,
    accessToken: string
  ): Promise<BasicQuizDataDTO> {
    // Get the original quiz data
    const originalQuiz = await this.getQuizById(quizId, accessToken);
    
    // Create a new quiz with modified title
    const duplicateData: InstructorQuizCreateRequest = {
      title: `${originalQuiz.title} (Copy)`,
      description: originalQuiz.description,
      settings: originalQuiz.settings,
      attachmentId: originalQuiz.attachmentId
    };
    
    return this.createQuiz(duplicateData, accessToken);
  }

  /**
   * Search quizzes with debounced search functionality
   */
  async searchQuizzes(
    searchTerm: string,
    accessToken: string,
    status?: QuizStatus
  ): Promise<PageableResponse<BasicQuizDataDTO>> {
    return this.getQuizzes({
      search: searchTerm,
      status,
      page: 0,
      size: 20
    }, accessToken);
  }
}

// Export a singleton instance
export const quizService = new QuizService();