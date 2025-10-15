import { apiClient } from '@/lib/api';
import { IApiResponse, extractApiData } from '@/types/api';
import { IPageableList } from '@/types/common';

import {
  InstructorQuestionSaveRequest,
  QuestionDataDto,
  QuestionFilter,
  QuestionReorderItem,
} from '../types/question';
import { questionDataDtoSchema, questionListSchema } from '../schemas/questionSchema';

export class QuestionService {
  static async createQuestion(
    data: InstructorQuestionSaveRequest
  ): Promise<QuestionDataDto> {
    const response: IApiResponse<QuestionDataDto> = await apiClient.post(
      '/instructor/quizzes/:quizId/questions',
      data,
      { params: { quizId: data.quizId } }
    );
    const dto = extractApiData(response);
    return questionDataDtoSchema.parse(dto);
  }

  static async updateQuestion(
    questionId: number,
    data: InstructorQuestionSaveRequest
  ): Promise<QuestionDataDto> {
    const response: IApiResponse<QuestionDataDto> = await apiClient.put(
      `/instructor/quizzes/:quizId/questions/:id`,
      data,
      { params: { quizId: data.quizId, id: questionId } }
    );
    const dto = extractApiData(response);
    return questionDataDtoSchema.parse(dto);
  }

  static async deleteQuestion(
    quizId: number,
    questionId: number
  ): Promise<void> {
    const response: IApiResponse<void> = await apiClient.delete(
      `/instructor/quizzes/:quizId/questions/:id`,
      { params: { quizId, id: questionId } }
    );
    extractApiData(response);
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
    const data = extractApiData(response);
    return questionListSchema.parse(data);
  }

  static async getQuestion(
    quizId: number,
    questionId: number,
    signal?: AbortSignal
  ): Promise<QuestionDataDto> {
    const response: IApiResponse<QuestionDataDto> = await apiClient.get(
      `/instructor/quizzes/:quizId/questions/:id`,
      { signal, params: { quizId, id: questionId } }
    );
    const dto = extractApiData(response);
    return questionDataDtoSchema.parse(dto);
  }

  static async reorderQuestions(
    quizId: number,
    items: QuestionReorderItem[]
  ): Promise<void> {
    const response: IApiResponse<void> = await apiClient.put(
      `/instructor/quizzes/:quizId/questions/reorder`,
      items,
      { params: { quizId } }
    );
    extractApiData(response);
  }
}
