import { apiClient } from '@/lib/api';
import { IApiResponse, extractApiData } from '@/types/api';
import { IPageableList } from '@/types/common';
import { pageableSchema } from '@/components/shared/schemas/pageable.schema';
import {
    InstructorQuestionSaveRequest,
    QuestionDataDto, QuestionFilter,
    QuestionReorderItem,
} from '../types/question';
import { questionDataDtoSchema } from '../schemas/questionSchema';

export class QuestionService {
  /**
   * Create a new question for a quiz
   */
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

  /**
   * Update an existing question
   */
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

  /**
   * Delete a question
   */
  static async deleteQuestion(
    quizId: number,
    questionId: number
  ): Promise<void> {
    await apiClient.delete(`/instructor/quizzes/:quizId/questions/:id`, {
      params: { quizId, id: questionId },
    });
  }

  /**
   * Get paginated list of questions for a quiz
   */
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

    // Validate pageable response using shared reusable schema
    return pageableSchema(questionDataDtoSchema).parse(data);
  }

  /**
   * Get a single question by ID
   */
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

  /**
   * Reorder questions in a quiz
   */
  static async reorderQuestions(
    quizId: number,
    items: QuestionReorderItem[]
  ): Promise<void> {
    await apiClient.put(
      `/instructor/quizzes/:quizId/questions/reorder`,
      items,
      { params: { quizId } }
    );
  }
}
