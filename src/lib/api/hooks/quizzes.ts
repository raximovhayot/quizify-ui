/**
import { AxiosError } from 'axios';
 * React Query hooks for quiz operations
 * Uses TanStack Query for server state management
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { quizzesApi, type QuizListParams, type Quiz } from '@/lib/api/endpoints/quizzes';
import { queryKeys } from '@/lib/query/keys';

/**
 * Get paginated list of quizzes
 */
export const useQuizzes = (params?: QuizListParams) => {
  return useQuery({
    queryKey: queryKeys.quizzes.list(params),
    queryFn: async () => {
      const response = await quizzesApi.getAll(params);
      return response.data;
    },
  });
};

/**
 * Get single quiz by ID
 */
export const useQuiz = (id: number, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.quizzes.detail(id),
    queryFn: async () => {
      const response = await quizzesApi.getById(id);
      return response.data;
    },
    enabled: enabled && !!id,
  });
};

/**
 * Create a new quiz
 */
export const useCreateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { title: string; description?: string; status?: 'DRAFT' | 'PUBLISHED' }) => {
      const response = await quizzesApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.all });
      toast.success('Quiz created successfully');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Failed to create quiz');
    },
  });
};

/**
 * Update an existing quiz
 */
export const useUpdateQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: { title?: string; description?: string; status?: 'DRAFT' | 'PUBLISHED' } }) => {
      const response = await quizzesApi.update(id, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.lists() });
      toast.success('Quiz updated successfully');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Failed to update quiz');
    },
  });
};

/**
 * Update quiz status (publish/unpublish)
 */
export const useUpdateQuizStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'DRAFT' | 'PUBLISHED' }) => {
      const response = await quizzesApi.updateStatus(id, status);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.lists() });
      toast.success(`Quiz ${variables.status === 'PUBLISHED' ? 'published' : 'unpublished'} successfully`);
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Failed to update quiz status');
    },
  });
};

/**
 * Delete a quiz
 */
export const useDeleteQuiz = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await quizzesApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.all });
      toast.success('Quiz deleted successfully');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Failed to delete quiz');
    },
  });
};
