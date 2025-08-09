import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

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

// Query keys
export const quizKeys = {
  all: ['quizzes'] as const,
  lists: () => [...quizKeys.all, 'list'] as const,
  list: (filter: QuizFilter) => [...quizKeys.lists(), filter] as const,
  details: () => [...quizKeys.all, 'detail'] as const,
  detail: (id: number) => [...quizKeys.details(), id] as const,
};

// Hook for fetching paginated quizzes list
export function useQuizzes(filter: QuizFilter = {}) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: quizKeys.list(filter),
    queryFn: async (): Promise<TQuizListResponse> => {
      if (!session?.accessToken) {
        throw new Error('No access token available');
      }

      const response = await QuizService.getQuizzes(
        filter,
        session.accessToken
      );

      // Validate response with Zod schema
      const validatedResponse = quizListResponseSchema.parse(response);
      return validatedResponse;
    },
    enabled: !!session?.accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for fetching single quiz
export function useQuiz(quizId: number) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: quizKeys.detail(quizId),
    queryFn: async (): Promise<QuizDataDTO> => {
      if (!session?.accessToken) {
        throw new Error('No access token available');
      }

      const response = await QuizService.getQuiz(quizId, session.accessToken);

      // Validate response with Zod schema
      const validatedResponse = quizDataDTOSchema.parse(response);
      return validatedResponse;
    },
    enabled: !!session?.accessToken && !!quizId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for creating quiz
export function useCreateQuiz() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const t = useTranslations();

  return useMutation({
    mutationFn: async (
      data: InstructorQuizCreateRequest
    ): Promise<QuizDataDTO> => {
      if (!session?.accessToken) {
        throw new Error('No access token available');
      }

      const response = await QuizService.createQuiz(data, session.accessToken);

      // Validate response with Zod schema
      const validatedResponse = quizDataDTOSchema.parse(response);
      return validatedResponse;
    },
    onSuccess: (data) => {
      // Invalidate and refetch quiz lists
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });

      // Add the new quiz to cache
      queryClient.setQueryData(quizKeys.detail(data.id), data);

      toast.success(
        t('instructor.quiz.create.success', {
          fallback: 'Quiz created successfully',
        })
      );
    },
    onError: (error) => {
      console.error('Failed to create quiz:', error);
      toast.error(
        t('instructor.quiz.create.error', {
          fallback: 'Failed to create quiz',
        })
      );
    },
  });
}

// Hook for updating quiz
export function useUpdateQuiz() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const t = useTranslations();

  return useMutation({
    mutationFn: async (
      data: InstructorQuizUpdateRequest
    ): Promise<QuizDataDTO> => {
      if (!session?.accessToken || !data.id) {
        throw new Error('No access token or quiz ID available');
      }

      const response = await QuizService.updateQuiz(
        data.id,
        data,
        session.accessToken
      );

      // Validate response with Zod schema
      const validatedResponse = quizDataDTOSchema.parse(response);
      return validatedResponse;
    },
    onSuccess: (data) => {
      // Invalidate and refetch quiz lists
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });

      // Update the quiz in cache
      queryClient.setQueryData(quizKeys.detail(data.id), data);

      toast.success(
        t('instructor.quiz.update.success', {
          fallback: 'Quiz updated successfully',
        })
      );
    },
    onError: (error) => {
      console.error('Failed to update quiz:', error);
      toast.error(
        t('instructor.quiz.update.error', {
          fallback: 'Failed to update quiz',
        })
      );
    },
  });
}

// Hook for updating quiz status
export function useUpdateQuizStatus() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const t = useTranslations();

  return useMutation({
    mutationFn: async (
      data: InstructorQuizUpdateStatusRequest
    ): Promise<void> => {
      if (!session?.accessToken) {
        throw new Error('No access token available');
      }

      await QuizService.updateQuizStatus(data.id, data, session.accessToken);
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
    onError: (error) => {
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
  const { data: session } = useSession();
  const t = useTranslations();

  return useMutation({
    mutationFn: async (quizId: number): Promise<void> => {
      if (!session?.accessToken) {
        throw new Error('No access token available');
      }

      await QuizService.deleteQuiz(quizId, session.accessToken);
    },
    onSuccess: (_, quizId) => {
      // Invalidate and refetch quiz lists
      queryClient.invalidateQueries({ queryKey: quizKeys.lists() });

      // Remove the quiz from cache
      queryClient.removeQueries({ queryKey: quizKeys.detail(quizId) });

      toast.success(
        t('instructor.quiz.delete.success', {
          fallback: 'Quiz deleted successfully',
        })
      );
    },
    onError: (error) => {
      console.error('Failed to delete quiz:', error);
      toast.error(
        t('instructor.quiz.delete.error', {
          fallback: 'Failed to delete quiz',
        })
      );
    },
  });
}
