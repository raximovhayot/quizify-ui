import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { ROUTES_APP } from '@/components/features/instructor/routes';

import { assignmentKeys } from '../keys';
import { AssignmentService } from '../services/assignmentService';
import { AssignmentCreateRequest } from '../types/assignment';

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useTranslations();

  return useMutation({
    mutationFn: async (request: AssignmentCreateRequest) => {
      return AssignmentService.createAssignment(request);
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
      toast.success(
        t('instructor.assignment.create.success', {
          fallback: 'Assignment created successfully',
        })
      );
      router.push(ROUTES_APP.analytics.root());
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
          t('instructor.assignment.create.error', {
            fallback: 'Failed to create assignment',
          })
      );
    },
  });
}
