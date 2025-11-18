/**
import { AxiosError } from 'axios';
 * React Query hooks for attempt operations (quiz-taking)
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { attemptsApi, type SubmitAttemptRequest, type AttemptListParams } from '@/lib/api/endpoints/attempts';
import { queryKeys } from '@/lib/query/keys';

/**
 * Get student's attempts
 */
export const useMyAttempts = (params?: AttemptListParams) => {
  return useQuery({
    queryKey: queryKeys.attempts.list(params),
    queryFn: async () => {
      const response = await attemptsApi.getMyAttempts(params);
      return response.data;
    },
  });
};

/**
 * Get attempt by ID
 */
export const useAttempt = (id: number, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.attempts.detail(id),
    queryFn: async () => {
      const response = await attemptsApi.getAttemptById(id);
      return response.data;
    },
    enabled: enabled && !!id,
  });
};

/**
 * Get attempt content (questions and answers)
 */
export const useAttemptContent = (id: number, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.attempts.content(id),
    queryFn: async () => {
      const response = await attemptsApi.getAttemptContent(id);
      return response.data;
    },
    enabled: enabled && !!id,
    refetchInterval: false, // Don't auto-refetch during quiz
  });
};

/**
 * Start a new attempt
 */
export const useStartAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignmentId: number) => {
      const response = await attemptsApi.startAttempt(assignmentId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attempts.all });
      toast.success('Attempt started successfully');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Failed to start attempt');
    },
  });
};

/**
 * Submit an attempt
 */
export const useSubmitAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: SubmitAttemptRequest }) => {
      const response = await attemptsApi.submitAttempt(id, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attempts.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.attempts.lists() });
      toast.success('Attempt submitted successfully');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Failed to submit attempt');
    },
  });
};

/**
 * Save attempt progress (auto-save)
 */
export const useSaveAttemptProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: SubmitAttemptRequest }) => {
      const response = await attemptsApi.saveProgress(id, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(queryKeys.attempts.detail(variables.id), data);
    },
    onError: () => {
      // Silent fail for auto-save
    },
  });
};

/**
 * Get attempts for an assignment (instructor view)
 */
export const useAssignmentAttempts = (assignmentId: number, params?: AttemptListParams, enabled = true) => {
  return useQuery({
    queryKey: [...queryKeys.attempts.lists(), 'assignment', assignmentId, params],
    queryFn: async () => {
      const response = await attemptsApi.getAssignmentAttempts(assignmentId, params);
      return response.data;
    },
    enabled: enabled && !!assignmentId,
  });
};

/**
 * Get attempt details (instructor view)
 */
export const useAttemptDetails = (id: number, enabled = true) => {
  return useQuery({
    queryKey: [...queryKeys.attempts.detail(id), 'details'],
    queryFn: async () => {
      const response = await attemptsApi.getAttemptDetails(id);
      return response.data;
    },
    enabled: enabled && !!id,
  });
};

/**
 * Grade an attempt (instructor)
 */
export const useGradeAttempt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, score }: { id: number; score: number }) => {
      const response = await attemptsApi.gradeAttempt(id, score);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.attempts.detail(variables.id) });
      toast.success('Attempt graded successfully');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Failed to grade attempt');
    },
  });
};
