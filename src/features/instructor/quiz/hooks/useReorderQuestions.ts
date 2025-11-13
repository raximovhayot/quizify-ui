import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useReorderQuestions as useReorderQuestionsBase } from '@/lib/api/hooks/questions';
import { questionKeys } from '../keys';
import type { IPageableList } from '@/types/common';
import type { QuestionDataDto, QuestionReorderItem, QuestionFilter } from '../types/question';

export interface QuestionsFilter {
  quizId: number;
  page?: number;
  size?: number;
}

/**
 * Reorder questions within a quiz using optimistic updates.
 * Accepts the filter used by useQuestions to ensure the cache key matches exactly.
 */
export function useReorderQuestions(quizId: number, filter: QuestionFilter) {
  const qc = useQueryClient();
  const baseReorder = useReorderQuestionsBase(quizId);

  return useMutation({
    mutationFn: async (next: QuestionDataDto[]) => {
      const orderArray = next.map((q, index) => q.id);
      await baseReorder.mutateAsync(orderArray);
    },
    onMutate: async (next) => {
      const key = questionKeys.list(filter);
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<QuestionDataDto[]>(key);

      // Optimistically update current page content order
      qc.setQueryData<QuestionDataDto[]>(key, () => {
        return next.map((q, index) => ({ ...q, order: index }));
      });

      return { previous } as const;
    },
    onError: (_err, _next, ctx) => {
      const key = questionKeys.list(filter);
      if (ctx?.previous) {
        qc.setQueryData(key, ctx.previous);
      }
    },
    onSettled: () => {
      // Ensure server state is reflected
      qc.invalidateQueries({ queryKey: questionKeys.lists() });
    },
  });
}
