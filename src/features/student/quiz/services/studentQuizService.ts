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
}
