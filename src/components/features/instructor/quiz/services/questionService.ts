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
    data: InstructorQuestionSaveRequest,
    accessToken: string
  ): Promise<QuestionDataDto> {
    const response: IApiResponse<QuestionDataDto> = await apiClient.post(
      '/instructor/questions',
      data,
      { token: accessToken }
    );
    return extractApiData(response);
  }

  static async getQuestions(
    filter: QuestionFilter,
    accessToken: string,
    signal?: AbortSignal
  ): Promise<IPageableList<QuestionDataDto>> {
    const response: IApiResponse<IPageableList<QuestionDataDto>> =
      await apiClient.get(`/instructor/questions`, {
        token: accessToken,
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
