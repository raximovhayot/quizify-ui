import { z } from 'zod';

import { questionDataDtoSchema } from '@/features/instructor/quiz/schemas/questionSchema';
import { quizDataDTOSchema } from '@/features/instructor/quiz/schemas/quizSchema';
import { QuestionDataDto } from '@/features/instructor/quiz/types/question';
import { QuizDataDTO } from '@/features/instructor/quiz/types/quiz';
import { apiClient } from '@/lib/api';
import { IApiResponse, extractApiData } from '@/types/api';

/**
 * StudentQuizService - Fetches quiz details and questions for students
 */
export class StudentQuizService {
  /**
   * Get quiz details visible to student by ID
   */
  static async getQuiz(
    quizId: number,
    signal?: AbortSignal
  ): Promise<QuizDataDTO> {
    const response: IApiResponse<QuizDataDTO> = await apiClient.get(
      `/student/quizzes/:id`,
      { signal, params: { id: quizId } }
    );
    const data = extractApiData(response);
    return quizDataDTOSchema.parse(data);
  }

  /**
   * Get all questions for a quiz visible to student
   */
  static async getQuizQuestions(
    quizId: number,
    signal?: AbortSignal
  ): Promise<QuestionDataDto[]> {
    const response: IApiResponse<QuestionDataDto[]> = await apiClient.get(
      `/student/quizzes/:id/questions`,
      { signal, params: { id: quizId } }
    );
    const data = extractApiData(response);
    return z.array(questionDataDtoSchema).parse(data);
  }

  /**
   * Get student's registered upcoming quizzes
   * @deprecated Backend no longer exposes /student/quizzes/upcoming. Use StudentAssignmentService.getRegistrations(...) and StudentAttemptService.getAttempts(...) instead.
   */
  static async getUpcomingQuizzes(
    signal?: AbortSignal
  ): Promise<QuizDataDTO[]> {
    const response: IApiResponse<QuizDataDTO[]> = await apiClient.get(
      `/student/quizzes/upcoming`,
      { signal }
    );
    const data = extractApiData(response);
    return z.array(quizDataDTOSchema).parse(data);
  }

  /**
   * Get student's in-progress quizzes
   * @deprecated Backend no longer exposes /student/quizzes/in-progress. Use StudentAttemptService.getAttempts({ status: 'IN_PROGRESS' }) instead.
   */
  static async getInProgressQuizzes(
    signal?: AbortSignal
  ): Promise<QuizDataDTO[]> {
    const response: IApiResponse<QuizDataDTO[]> = await apiClient.get(
      `/student/quizzes/in-progress`,
      { signal }
    );
    const data = extractApiData(response);
    return z.array(quizDataDTOSchema).parse(data);
  }

  /**
   * Join a quiz by join code
   * @deprecated Backend uses assignment-based joining. Use StudentAssignmentService.join(code) instead and navigate to the returned attemptId.
   */
  static async joinWithCode(
    code: string
  ): Promise<IApiResponse<{ quizId?: number } | QuizDataDTO>> {
    const response: IApiResponse<{ quizId?: number } | QuizDataDTO> =
      await apiClient.post(`/student/quizzes/join`, { code });
    return response;
  }
}
