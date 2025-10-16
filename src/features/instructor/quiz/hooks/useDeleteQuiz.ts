import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useTranslations } from 'next-intl';

import { quizKeys } from '@/features/instructor/quiz/keys';

import { TQuizListResponse } from '../schemas/quizSchema';
import { QuizService } from '../services/quizService';
import { QuizDataDTO } from '../types/quiz';

// Hook for deleting quiz
export function useDeleteQuiz() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: async (quizId: number): Promise<void> => {
      await QuizService.deleteQuiz(quizId);
    },
    onMutate: async (quizId) => {
      // Cancel outgoing refetches so we don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: quizKeys.lists() });

      // Snapshot previous lists
      const previousLists = queryClient.getQueriesData<TQuizListResponse>({
        queryKey: quizKeys.lists(),
      });

      // Optimistically update lists by removing the quiz
      previousLists.forEach(([key, data]) => {
        if (!data) return;
        const content = data.content.filter((q) => q.id !== quizId);
        queryClient.setQueryData<TQuizListResponse>(key, {
          ...data,
          content,
          totalElements: Math.max(0, data.totalElements - 1),
        });
      });

      // Snapshot detail and optimistically remove it
      const previousDetail = queryClient.getQueryData<QuizDataDTO>(
        quizKeys.detail(quizId)
      );
      queryClient.removeQueries({ queryKey: quizKeys.detail(quizId) });

      return { previousLists, previousDetail, quizId };
    },
    onSuccess: (_, quizId) => {
      // Invalidate and refetch quiz lists
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });

      // Ensure the quiz detail is removed from cache
      queryClient.removeQueries({ queryKey: quizKeys.detail(quizId) });

      toast.success(
        t('instructor.quiz.delete.success', {
          fallback: 'Quiz deleted successfully',
        })
      );
    },
    onError: (error, quizId, context) => {
      // Rollback on error
      if (context?.previousLists) {
        context.previousLists.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(
          quizKeys.detail(context.quizId),
          context.previousDetail
        );
      }

      toast.error(
        t('instructor.quiz.delete.error', {
          fallback: 'Failed to delete quiz',
        })
      );
    },
  });
}
