import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QuestionService } from '../services/questionService';
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

  return useMutation({
    mutationFn: async (next: QuestionDataDto[]) => {
      const items: QuestionReorderItem[] = next.map((q, index) => ({ id: q.id, order: index }));
      await QuestionService.reorderQuestions(quizId, items);
    },
    onMutate: async (next) => {
      const key = questionKeys.list(filter);
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<IPageableList<QuestionDataDto>>(key);

      // Optimistically update current page content order
      qc.setQueryData<IPageableList<QuestionDataDto>>(key, (old) => {
        if (!old) return old;
        return {
          ...old,
          content: next.map((q, index) => ({ ...q, order: index })),
        };
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
