import { useQueryClient, useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { assignmentKeys } from '../keys';
import { assignmentDataDTOSchema } from '../schemas/assignmentSchema';
import { AssignmentDTO } from '../types/assignment';
import { queryKeys } from '@/lib/query/keys';

// Hook for updating an assignment
export function useUpdateAssignment() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: async (data: Partial<AssignmentDTO> & { id: number }) => {
      // TODO: Implement update endpoint in centralized API when backend supports it
      throw new Error('Update assignment endpoint not yet implemented');
    },
    onSuccess: (updated: AssignmentDTO) => {
      // Validate and prime the detail cache for consistency
      const validated = assignmentDataDTOSchema.parse(updated);
      queryClient.setQueryData(assignmentKeys.detail(validated.id), validated);
      queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all });
      toast.success(t('common.entities.assignment.updateSuccess', {
        fallback: 'Assignment updated successfully',
      }));
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.message || 'Failed to update assignment');
    },
  });
}
