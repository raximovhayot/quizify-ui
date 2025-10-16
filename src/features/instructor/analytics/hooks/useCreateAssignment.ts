import { useQueryClient } from '@tanstack/react-query';

import { useTranslations } from 'next-intl';

import { ROUTES_APP } from '@/features/instructor/routes';
import { createMutation } from '@/lib/mutation-utils';

import { assignmentKeys } from '../keys';
import { assignmentDataDTOSchema } from '../schemas/assignmentSchema';
import { AssignmentService } from '../services/assignmentService';
import { AssignmentCreateRequest, AssignmentDTO } from '../types/assignment';

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return createMutation<AssignmentDTO, AssignmentCreateRequest>({
    mutationFn: async (request) => {
      const created = await AssignmentService.createAssignment(request);
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
