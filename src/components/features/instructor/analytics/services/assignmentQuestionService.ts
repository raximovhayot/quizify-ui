import { apiClient } from '@/lib/api';
import { IApiResponse, extractApiData } from '@/types/api';
import { IPageableList } from '@/types/common';

import { pageableSchema } from '@/components/shared/schemas/pageable.schema';
import { questionDataDtoSchema } from '@/components/features/instructor/quiz/schemas/questionSchema';
import { QuestionDataDto } from '@/components/features/instructor/quiz/types/question';

const pageableQuestionListSchema = pageableSchema(questionDataDtoSchema);

/**
 * AssignmentQuestionService — list/view questions attached to an assignment
 * Backend: InstructorAssignmentQuestionController
 *  - GET /instructor/assignments/:assignmentId/questions
 *  - GET /instructor/assignments/:assignmentId/questions/:questionId
 */
export class AssignmentQuestionService {
  static async getQuestions(
    assignmentId: number,
    params?: { page?: number; size?: number },
    signal?: AbortSignal
  ): Promise<IPageableList<QuestionDataDto>> {
    const response: IApiResponse<IPageableList<QuestionDataDto>> =
      await apiClient.get('/instructor/assignments/:assignmentId/questions', {
        signal,
        params: { assignmentId },
        query: { page: params?.page, size: params?.size },
      });
    const data = extractApiData(response);
    return pageableQuestionListSchema.parse(data);
  }

  static async getQuestion(
    assignmentId: number,
    questionId: number,
    signal?: AbortSignal
  ): Promise<QuestionDataDto> {
    const response: IApiResponse<QuestionDataDto> = await apiClient.get(
      '/instructor/assignments/:assignmentId/questions/:questionId',
      { signal, params: { assignmentId, questionId } }
    );
    const data = extractApiData(response);
    return questionDataDtoSchema.parse(data);
  }
}
