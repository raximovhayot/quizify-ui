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
      '/instructor/questions',
      data
    );
    return response;
  }

  static async updateQuestion(
    questionId: number,
    data: InstructorQuestionSaveRequest
  ): Promise<IApiResponse<QuestionDataDto>> {
    const response: IApiResponse<QuestionDataDto> = await apiClient.put(
      `/instructor/questions/${questionId}`,
      data
    );
    return response;
  }

  static async deleteQuestion(questionId: number): Promise<IApiResponse<void>> {
    const response: IApiResponse<void> = await apiClient.delete(
      `/instructor/questions/${questionId}`
    );
    return response;
  }

  static async getQuestions(
    filter: QuestionFilter,
    signal?: AbortSignal
  ): Promise<IPageableList<QuestionDataDto>> {
    const response: IApiResponse<IPageableList<QuestionDataDto>> =
      await apiClient.get(`/instructor/questions/:quizId/list`, {
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
