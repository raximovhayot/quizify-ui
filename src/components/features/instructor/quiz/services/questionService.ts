import { apiClient } from '@/lib/api';
import { IApiResponse, extractApiData } from '@/types/api';
import { IPageableList } from '@/types/common';

import {
  InstructorQuestionSaveRequest,
  QuestionDataDto,
  QuestionFilter,
} from '../types/question';

export class QuestionService {
  static async createQuestion(
    data: InstructorQuestionSaveRequest
  ): Promise<IApiResponse<QuestionDataDto>> {
    const response: IApiResponse<QuestionDataDto> = await apiClient.post(
      '/instructor/quizzes/:quizId/questions',
      data,
      { params: { quizId: data.quizId } }
    );
    return response;
  }

  static async updateQuestion(
    questionId: number,
    data: InstructorQuestionSaveRequest
  ): Promise<IApiResponse<QuestionDataDto>> {
    const response: IApiResponse<QuestionDataDto> = await apiClient.put(
      `/instructor/quizzes/:quizId/questions/:id`,
      data,
      { params: { quizId: data.quizId, id: questionId } }
    );
    return response;
  }

  static async deleteQuestion(
    quizId: number,
    questionId: number
  ): Promise<IApiResponse<void>> {
    const response: IApiResponse<void> = await apiClient.delete(
      `/instructor/quizzes/:quizId/questions/:id`,
      { params: { quizId, id: questionId } }
    );
    return response;
  }

  static async getQuestions(
    filter: QuestionFilter,
    signal?: AbortSignal
  ): Promise<IPageableList<QuestionDataDto>> {
    const response: IApiResponse<IPageableList<QuestionDataDto>> =
      await apiClient.get(`/instructor/quizzes/:quizId/questions`, {
        signal,
        params: { quizId: filter.quizId },
        query: {
          page: filter.page,
          size: filter.size,
        },
      });
    return extractApiData(response);
  }
}
