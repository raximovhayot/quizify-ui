import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useTranslations } from 'next-intl';

import { quizKeys } from '@/components/features/instructor/quiz/keys';
import { handleApiResponse } from '@/lib/api-utils';

import { TQuizListResponse } from '../schemas/quizSchema';
import { QuizService } from '../services/quizService';
import { InstructorQuizUpdateStatusRequest, QuizDataDTO } from '../types/quiz';

// Hook for updating quiz status
export function useUpdateQuizStatus() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: async (
      data: InstructorQuizUpdateStatusRequest
    ): Promise<void> => {
      const resp = await QuizService.updateQuizStatus(data.id, data);
      // Normalize and throw on error to trigger onError and toast via api-utils
      // Success path continues to optimistic success handler
      // This keeps optimistic UI and centralizes error toasts
      handleApiResponse(resp);
    },
    onMutate: async (variables) => {
      // Cancel outgoing refetches so we don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: quizKeys.lists() });

      // Snapshot previous lists
      const previousLists = queryClient.getQueriesData<TQuizListResponse>({
        queryKey: quizKeys.lists(),
      });

      // Optimistically update lists
      previousLists.forEach(([key, data]) => {
        if (!data) return;
        const content = data.content.map((q) =>
          q.id === variables.id ? { ...q, status: variables.status } : q
        );
        queryClient.setQueryData<TQuizListResponse>(key, {
          ...data,
          content,
        });
      });

      // Snapshot and optimistically update detail
      let previousDetail: QuizDataDTO | undefined;
      if (variables?.id) {
        previousDetail = queryClient.getQueryData<QuizDataDTO>(
          quizKeys.detail(variables.id)
        );
        if (previousDetail) {
          queryClient.setQueryData<QuizDataDTO>(quizKeys.detail(variables.id), {
            ...previousDetail,
            status: variables.status,
          });
        }
      }

      return { previousLists, previousDetail };
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch quiz lists
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });

      // Invalidate the quiz detail cache to refetch if needed
      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: quizKeys.detail(variables.id),
        });
      }

      toast.success(
        t('instructor.quiz.status.update.success', {
          fallback: 'Quiz status updated successfully',
        })
      );
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousLists) {
        context.previousLists.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      if (variables?.id && context?.previousDetail) {
        queryClient.setQueryData(
          quizKeys.detail(variables.id),
          context.previousDetail
        );
      }

      console.error('Failed to update quiz status:', error);
      toast.error(
        t('instructor.quiz.status.update.error', {
          fallback: 'Failed to update quiz status',
        })
      );
    },
  });
}
