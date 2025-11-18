/**
import { AxiosError } from 'axios';
 * React Query hooks for question operations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { questionsApi, type Question, type QuestionCreateRequest, type QuestionUpdateRequest } from '@/lib/api/endpoints/questions';
import { queryKeys } from '@/lib/query/keys';

/**
 * Get all questions for a quiz
 */
export const useQuestions = (quizId: number, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.questions.list(quizId),
    queryFn: async () => {
      const response = await questionsApi.getAll(quizId);
      return response.data;
    },
    enabled: enabled && !!quizId,
  });
};

/**
 * Get single question by ID
 */
export const useQuestion = (quizId: number, questionId: number, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.questions.detail(questionId),
    queryFn: async () => {
      const response = await questionsApi.getById(quizId, questionId);
      return response.data;
    },
    enabled: enabled && !!quizId && !!questionId,
  });
};

/**
 * Create a new question
 */
export const useCreateQuestion = (quizId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: QuestionCreateRequest) => {
      const response = await questionsApi.create(quizId, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.list(quizId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.detail(quizId) });
      toast.success('Question created successfully');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Failed to create question');
    },
  });
};

/**
 * Update an existing question
 */
export const useUpdateQuestion = (quizId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ questionId, data }: { questionId: number; data: QuestionUpdateRequest }) => {
      const response = await questionsApi.update(quizId, questionId, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.detail(variables.questionId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.list(quizId) });
      toast.success('Question updated successfully');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Failed to update question');
    },
  });
};

/**
 * Delete a question
 */
export const useDeleteQuestion = (quizId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionId: number) => {
      await questionsApi.delete(quizId, questionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.list(quizId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes.detail(quizId) });
      toast.success('Question deleted successfully');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Failed to delete question');
    },
  });
};

/**
 * Reorder questions in a quiz
 */
export const useReorderQuestions = (quizId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionIds: number[]) => {
      await questionsApi.reorder(quizId, questionIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questions.list(quizId) });
      toast.success('Questions reordered successfully');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Failed to reorder questions');
    },
  });
};
