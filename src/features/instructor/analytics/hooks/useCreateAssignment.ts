import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { ROUTES_APP } from '@/features/dashboard/routes';
import { createMutation } from '@/lib/mutation-utils';
import { useCreateAssignment as useCreateAssignmentBase } from '@/lib/api/hooks/assignments';

import { assignmentKeys } from '../keys';
import { assignmentDataDTOSchema } from '../schemas/assignmentSchema';
import { AssignmentCreateRequest, AssignmentDTO } from '../types/assignment';

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  const t = useTranslations();
  const baseCreate = useCreateAssignmentBase();

  return createMutation<AssignmentDTO, AssignmentCreateRequest>({
    mutationFn: async (request) => {
      const created = await baseCreate.mutateAsync(request);
      return { data: created, errors: [] };
    },
    successMessage: t('common.entities.assignment.createSuccess', {
      fallback: 'Assignment created successfully',
    }),
    invalidateQueries: [assignmentKeys.lists()],
    redirectTo: (created) => ROUTES_APP.analytics.detail(created.id),
    onSuccess: (created) => {
      // Validate with Zod and prime detail cache for a snappier redirect
      const validated = assignmentDataDTOSchema.parse(created);
      queryClient.setQueryData(assignmentKeys.detail(validated.id), validated);
    },
  })();
}
