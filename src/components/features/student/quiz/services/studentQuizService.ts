import { QuestionDataDto } from '@/components/features/instructor/quiz/types/question';
import { QuizDataDTO } from '@/components/features/instructor/quiz/types/quiz';
import { apiClient } from '@/lib/api';
import { IApiResponse, extractApiData } from '@/types/api';
import { IPageableList } from '@/types/common';

/**
 * StudentQuizService - Fetches quiz details and questions for students
 */
export class StudentQuizService {
  /**
   * Get quiz details visible to student by ID
   */
  static async getQuiz(
    quizId: number,
    accessToken?: string,
    signal?: AbortSignal
  ): Promise<QuizDataDTO> {
    const response: IApiResponse<QuizDataDTO> = await apiClient.get(
      `/student/quizzes/${quizId}`,
      accessToken,
      signal
    );
    return extractApiData(response);
  }

  /**
   * Get all questions for a quiz visible to student
   */
  static async getQuizQuestions(
    quizId: number,
    accessToken?: string,
    signal?: AbortSignal
  ): Promise<QuestionDataDto[]> {
    const response: IApiResponse<QuestionDataDto[]> = await apiClient.get(
      `/student/quizzes/${quizId}/questions`,
      accessToken,
      signal
    );
    return extractApiData(response);
  }

  /**
   * Get student's registered upcoming quizzes
   */
  static async getUpcomingQuizzes(
    accessToken?: string,
    signal?: AbortSignal
  ): Promise<QuizDataDTO[]> {
    const response: IApiResponse<QuizDataDTO[]> = await apiClient.get(
      `/student/quizzes/upcoming`,
      accessToken,
      signal
    );
    return extractApiData(response);
  }

  /**
   * Get student's in-progress quizzes
   */
  static async getInProgressQuizzes(
    accessToken?: string,
    signal?: AbortSignal
  ): Promise<QuizDataDTO[]> {
    const response: IApiResponse<QuizDataDTO[]> = await apiClient.get(
      `/student/quizzes/in-progress`,
      accessToken,
      signal
    );
    return extractApiData(response);
  }

  /**
   * Join a quiz by join code
   */
  static async joinWithCode(
    code: string,
    accessToken?: string
  ): Promise<{ quizId?: number } | QuizDataDTO> {
    const response: IApiResponse<{ quizId?: number } | QuizDataDTO> =
      await apiClient.post(`/student/quizzes/join`, { code }, accessToken);
    return extractApiData(response);
  }
}
