import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSession } from 'next-auth/react';

import { toast } from 'sonner';

import { StudentAttemptService } from '../services/attemptService';
import { SubmitAnswerRequest } from '../types/attempt';

/**
 * Hook to start a new attempt
 */
export function useStartAttempt() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignmentId: number) => {
      if (!session?.accessToken) throw new Error('No access token available');
      return StudentAttemptService.startAttempt(
        assignmentId,
        session.accessToken
      );
    },
    onSuccess: (_data, assignmentId) => {
      queryClient.invalidateQueries({
        queryKey: ['student', 'assignment', assignmentId],
      });
      toast.success('Quiz started successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to start quiz');
    },
  });
}

/**
 * Hook to get attempt details with questions
 */
export function useAttempt(assignmentId: number, attemptId: number) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['student', 'attempt', assignmentId, attemptId],
    queryFn: async ({ signal }) => {
      if (!session?.accessToken) throw new Error('No access token available');
      return StudentAttemptService.getAttempt(
        assignmentId,
        attemptId,
        session.accessToken,
        signal
      );
    },
    enabled: !!session?.accessToken && !!assignmentId && !!attemptId,
    refetchInterval: 30000, // Refetch every 30 seconds to update time remaining
    staleTime: 10000,
  });
}

/**
 * Hook to submit an answer for a question
 */
export function useSubmitAnswer(assignmentId: number, attemptId: number) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (answerData: SubmitAnswerRequest) => {
      if (!session?.accessToken) throw new Error('No access token available');
      return StudentAttemptService.submitAnswer(
        assignmentId,
        attemptId,
        answerData,
        session.accessToken
      );
    },
    onSuccess: () => {
      // Invalidate attempt to refetch updated data
      queryClient.invalidateQueries({
        queryKey: ['student', 'attempt', assignmentId, attemptId],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save answer');
    },
  });
}

/**
 * Hook to submit the entire attempt (finish quiz)
 */
export function useSubmitAttempt(assignmentId: number, attemptId: number) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!session?.accessToken) throw new Error('No access token available');
      return StudentAttemptService.submitAttempt(
        assignmentId,
        attemptId,
        session.accessToken
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['student', 'attempt', assignmentId, attemptId],
      });
      queryClient.invalidateQueries({
        queryKey: ['student', 'attempts'],
      });
      toast.success('Quiz submitted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit quiz');
    },
  });
}

/**
 * Hook to get attempt results
 */
export function useAttemptResults(assignmentId: number, attemptId: number) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['student', 'attempt', 'results', assignmentId, attemptId],
    queryFn: async ({ signal }) => {
      if (!session?.accessToken) throw new Error('No access token available');
      return StudentAttemptService.getAttemptResults(
        assignmentId,
        attemptId,
        session.accessToken,
        signal
      );
    },
    enabled: !!session?.accessToken && !!assignmentId && !!attemptId,
    staleTime: 60000,
  });
}
