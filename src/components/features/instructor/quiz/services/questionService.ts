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
      accessToken
    );
    return extractApiData(response);
  }

  static async getQuestions(
    filter: QuestionFilter,
    accessToken: string,
    signal?: AbortSignal
  ): Promise<IPageableList<QuestionDataDto>> {
    const params = new URLSearchParams();
    params.set('quizId', String(filter.quizId));
    if (typeof filter.page !== 'undefined')
      params.set('page', String(filter.page));
    if (typeof filter.size !== 'undefined')
      params.set('size', String(filter.size));

    const response: IApiResponse<IPageableList<QuestionDataDto>> =
      await apiClient.get(
        `/instructor/questions?${params.toString()}`,
        accessToken,
        signal
      );
    return extractApiData(response);
  }
}
