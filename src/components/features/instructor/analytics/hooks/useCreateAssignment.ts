import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { toast } from 'sonner';

import { ROUTES_APP } from '@/components/features/instructor/routes';

import { AssignmentCreateRequest } from '../types/assignment';
import { AssignmentService } from '../services/assignmentService';
import { assignmentKeys } from './useAssignments';

export function useCreateAssignment() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (request: AssignmentCreateRequest) => {
      if (!session?.accessToken) throw new Error('No access token available');
      return AssignmentService.createAssignment(request, session.accessToken);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
      toast.success('Assignment created successfully');
      router.push(ROUTES_APP.analytics.root());
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create assignment');
    },
  });
}
