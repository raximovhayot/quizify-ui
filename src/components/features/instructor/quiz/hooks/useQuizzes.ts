import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { quizKeys } from '@/components/features/instructor/quiz/keys';
import { handleApiResponse } from '@/lib/api-utils';
import { createMutation } from '@/lib/mutation-utils';

import {
  TQuizListResponse,
  quizDataDTOSchema,
  quizListResponseSchema,
} from '../schemas/quizSchema';
import { QuizService } from '../services/quizService';
import {
  InstructorQuizCreateRequest,
  InstructorQuizUpdateRequest,
  InstructorQuizUpdateStatusRequest,
  QuizDataDTO,
  QuizFilter,
} from '../types/quiz';

// Query keys are centralized in '@/components/features/instructor/quiz/keys'

// Hook for fetching paginated quizzes list
export function useQuizzes(filter: QuizFilter = {}) {
  const { status } = useSession();

  return useQuery({
    queryKey: quizKeys.list(filter),
    queryFn: async ({ signal }): Promise<TQuizListResponse> => {
      const response = await QuizService.getQuizzes(filter, signal);
      // Validate response with Zod schema
      const validatedResponse = quizListResponseSchema.parse(response);
      return validatedResponse;
    },
    enabled: status === 'authenticated',
    staleTime: 1 * 60 * 1000, // 1 minute (more responsive)
    gcTime: 15 * 60 * 1000, // 15 minutes (keep longer in cache)
    // Dedupe identical requests within 1 second
    structuralSharing: true,
    // Enable optimistic updates
    placeholderData: (previousData) => previousData,
  });
}

// Hook for fetching single quiz
export function useQuiz(quizId: number) {
  const { status } = useSession();

  return useQuery({
    queryKey: quizKeys.detail(quizId),
    queryFn: async ({ signal }): Promise<QuizDataDTO> => {
      const response = await QuizService.getQuiz(quizId, signal);
      // Validate response with Zod schema
      const validatedResponse = quizDataDTOSchema.parse(response);
      return validatedResponse;
    },
    enabled: status === 'authenticated' && !!quizId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes (quiz details are stable)
    // Use previous data while refetching
    placeholderData: (previousData) => previousData,
    // Prefetch related data
    select: (data) => {
      // You can transform data here if needed
      return data;
    },
  });
}

// Hook for creating quiz
export function useCreateQuiz() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return createMutation<QuizDataDTO, InstructorQuizCreateRequest>({
    mutationFn: async (data) => {
      const resp = await QuizService.createQuiz(data);
      return resp;
    },
    successMessage: t('instructor.quiz.create.success', {
      fallback: 'Quiz created successfully',
    }),
    invalidateQueries: [quizKeys.lists()],
    onSuccess: (data) => {
      // Validate with Zod and prime detail cache
      const validated = quizDataDTOSchema.parse(data);
      queryClient.setQueryData(quizKeys.detail(validated.id), validated);
    },
  })();
}

// Hook for updating quiz
export function useUpdateQuiz() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return createMutation<QuizDataDTO, InstructorQuizUpdateRequest>({
    mutationFn: async (data) => {
      if (!data.id) {
        throw new Error('Quiz ID is required for update');
      }
      const resp = await QuizService.updateQuiz(data.id, data);
      return resp;
    },
    successMessage: t('instructor.quiz.update.success', {
      fallback: 'Quiz updated successfully',
    }),
    invalidateQueries: [quizKeys.lists()],
    onSuccess: (data) => {
      // Validate and update detail cache
      const validated = quizDataDTOSchema.parse(data);
      queryClient.setQueryData(quizKeys.detail(validated.id), validated);
    },
  })();
}

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

// Hook for deleting quiz
export function useDeleteQuiz() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: async (quizId: number): Promise<void> => {
      const resp = await QuizService.deleteQuiz(quizId);
      handleApiResponse(resp);
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

      console.error('Failed to delete quiz:', error);
      toast.error(
        t('instructor.quiz.delete.error', {
          fallback: 'Failed to delete quiz',
        })
      );
    },
  });
}
