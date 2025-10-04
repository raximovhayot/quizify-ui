import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { toast } from 'sonner';

import { StudentAssignmentService } from '../services/assignmentService';
import {
  CheckJoinRequest,
  JoinAssignmentRequest,
} from '../types/registration';

/**
 * Query keys for assignment registrations
 */
export const registrationKeys = {
  all: ['student', 'registrations'] as const,
  list: (params?: { page?: number; size?: number; status?: string }) =>
    [...registrationKeys.all, 'list', params] as const,
};

/**
 * Hook to check if can join an assignment with code
 */
export function useCheckJoin() {
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (request: CheckJoinRequest) => {
      if (!session?.accessToken) throw new Error('No access token available');
      return StudentAssignmentService.checkJoin(request, session.accessToken);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to check assignment code');
    },
  });
}

/**
 * Hook to join an assignment with code
 */
export function useJoinAssignment() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (request: JoinAssignmentRequest) => {
      if (!session?.accessToken) throw new Error('No access token available');
      return StudentAssignmentService.joinWithCode(
        request,
        session.accessToken
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: registrationKeys.all });
      toast.success('Successfully joined assignment');
      // Navigate to assignment detail page
      router.push(`/student/assignments/${data.assignmentId}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to join assignment');
    },
  });
}

/**
 * Hook to get all registrations
 */
export function useRegistrations(params?: {
  page?: number;
  size?: number;
  status?: string;
}) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: registrationKeys.list(params),
    queryFn: async ({ signal }) => {
      if (!session?.accessToken) throw new Error('No access token available');
      return StudentAssignmentService.getRegistrations(
        session.accessToken,
        params,
        signal
      );
    },
    enabled: !!session?.accessToken,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to register for an assignment by ID
 */
export function useRegisterForAssignment() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (assignmentId: number) => {
      if (!session?.accessToken) throw new Error('No access token available');
      return StudentAssignmentService.registerForAssignment(
        assignmentId,
        session.accessToken
      );
    },
    onSuccess: (_data, assignmentId) => {
      queryClient.invalidateQueries({ queryKey: registrationKeys.all });
      toast.success('Successfully registered for assignment');
      // Navigate to assignment detail page
      router.push(`/student/assignments/${assignmentId}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to register for assignment');
    },
  });
}

/**
 * Hook to unregister from an assignment
 */
export function useUnregisterFromAssignment() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignmentId: number) => {
      if (!session?.accessToken) throw new Error('No access token available');
      return StudentAssignmentService.unregisterFromAssignment(
        assignmentId,
        session.accessToken
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: registrationKeys.all });
      toast.success('Successfully unregistered from assignment');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to unregister from assignment');
    },
  });
}
