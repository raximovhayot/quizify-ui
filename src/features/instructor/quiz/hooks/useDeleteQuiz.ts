import { useDeleteQuiz as useDeleteQuizBase } from '@/lib/api/hooks/quizzes';
import { useQueryClient, UseMutationOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { quizKeys } from '@/features/instructor/quiz/keys';
import type { TQuizListResponse } from '../schemas/quizSchema';
import type { QuizDataDTO } from '../types/quiz';

/**
 * Feature-specific wrapper around centralized useDeleteQuiz hook
 * Adds optimistic updates and translations
 */
export function useDeleteQuiz() {
  const queryClient = useQueryClient();
  const t = useTranslations();
  const baseDelete = useDeleteQuizBase();

  return {
    ...baseDelete,
    mutate: (quizId: number, options?: UseMutationOptions<void, AxiosError, number>) => {
      // Optimistic update logic
      const previousLists = queryClient.getQueriesData<TQuizListResponse>({
        queryKey: quizKeys.lists(),
      });

      const previousDetail = queryClient.getQueryData<QuizDataDTO>(
        quizKeys.detail(quizId)
      );

      // Optimistically update lists
      previousLists.forEach(([key, data]) => {
        if (!data) return;
        const content = data.content.filter((q) => q.id !== quizId);
        queryClient.setQueryData<TQuizListResponse>(key, {
          ...data,
          content,
          totalElements: Math.max(0, data.totalElements - 1),
        });
      });

      queryClient.removeQueries({ queryKey: quizKeys.detail(quizId) });

      baseDelete.mutate(quizId, {
        ...options,
        onSuccess: (data, variables, context) => {
          toast.success(
            t('instructor.quiz.delete.success', {
              fallback: 'Quiz deleted successfully',
            })
          );
          options?.onSuccess?.(data, variables, context);
        },
        onError: (error, variables, context) => {
          // Rollback on error
          previousLists.forEach(([key, data]) => {
            queryClient.setQueryData(key, data);
          });
          if (previousDetail) {
            queryClient.setQueryData(quizKeys.detail(quizId), previousDetail);
          }

          toast.error(
            t('instructor.quiz.delete.error', {
              fallback: 'Failed to delete quiz',
            })
          );
          options?.onError?.(error, variables, context);
        },
      });
    },
  };
}
