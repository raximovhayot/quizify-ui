import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { assignmentKeys } from '../keys';
import { IPageableList } from '@/types/common';
import { QuestionDataDto } from '@/features/instructor/quiz/types/question';

/**
 * useAssignmentQuestions — fetch questions attached to an assignment (no analytics)
 * Backend: GET /instructor/assignments/:assignmentId/questions
 * Defaults to 10 items per page.
 * 
 * TODO: Add this endpoint to centralized API when backend implements it
 */
export function useAssignmentQuestions(
  assignmentId: number,
  page = 0,
  size = 10
) {
  return useQuery<IPageableList<QuestionDataDto>>({
    queryKey: assignmentKeys.questions(assignmentId, { page, size }),
    queryFn: async () => {
      // Stub: Return empty pageable list until endpoint is implemented
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size,
        number: page,
      };
    },
    enabled: !!assignmentId,
    placeholderData: keepPreviousData,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 60 minutes
  });
}
