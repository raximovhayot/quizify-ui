import { useQuery } from '@tanstack/react-query';

import { questionKeys } from '@/features/instructor/quiz/keys';
import { IPageableList } from '@/types/common';

import { QuestionService } from '../services/questionService';
import type { QuestionDataDto, QuestionFilter } from '../types/question';

export function useQuestions(filter: QuestionFilter) {
  return useQuery<IPageableList<QuestionDataDto>>({
    queryKey: questionKeys.list(filter),
    queryFn: async ({ signal }) => {
      return await QuestionService.getQuestions(filter, signal);
    },
    enabled: !!filter?.quizId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Re-exports for backward compatibility after splitting hooks into separate files
export { useCreateQuestion } from './useCreateQuestion';
export { useUpdateQuestion } from './useUpdateQuestion';
export { useDeleteQuestion } from './useDeleteQuestion';
