import { useQueryClient } from '@tanstack/react-query';

import { useTranslations } from 'next-intl';

import { assignmentKeys } from '../keys';
import { assignmentDataDTOSchema } from '../schemas/assignmentSchema';
import { AssignmentService } from '../services/assignmentService';
import { AssignmentDTO } from '../types/assignment';
import { createMutation } from '@/lib/mutation-utils';

// Hook for updating an assignment
export function useUpdateAssignment() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return createMutation<AssignmentDTO, Partial<AssignmentDTO> & { id: number }>({
    mutationFn: async (data) => {
      if (!data.id) {
        throw new Error('Assignment ID is required for update');
      }
      const { id, ...payload } = data;
      const updated = await AssignmentService.updateAssignment(id, payload);
      return { data: updated, errors: [] };
    },
    successMessage: t('common.entities.assignment.updateSuccess', {
      fallback: 'Assignment updated successfully',
    }),
    invalidateQueries: [assignmentKeys.lists()],
    onSuccess: (updated) => {
      // Validate and prime the detail cache for consistency
      const validated = assignmentDataDTOSchema.parse(updated);
      queryClient.setQueryData(assignmentKeys.detail(validated.id), validated);
    },
  })();
}
