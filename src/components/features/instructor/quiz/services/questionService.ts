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

  static async getQuestions(
    filter: QuestionFilter,
    signal?: AbortSignal
  ): Promise<IPageableList<QuestionDataDto>> {
    const response: IApiResponse<IPageableList<QuestionDataDto>> =
      await apiClient.get(`/instructor/questions`, {
        signal,
        query: {
          quizId: filter.quizId,
          page: filter.page,
          size: filter.size,
        },
      });
    return extractApiData(response);
  }
}
