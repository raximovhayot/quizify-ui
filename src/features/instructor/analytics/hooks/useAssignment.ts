import { useQuery } from '@tanstack/react-query';

import { assignmentKeys } from '../keys';
import { assignmentDataDTOSchema } from '../schemas/assignmentSchema';
import { AssignmentService } from '../services/assignmentService';
import { AssignmentDTO } from '../types/assignment';

/**
 * useAssignment — fetch single assignment details by id
 * Follows the same pattern as `useQuiz`.
 */
export function useAssignment(id: number) {
  return useQuery<AssignmentDTO>({
    queryKey: assignmentKeys.detail(id),
    queryFn: async ({ signal }) => {
      const data = await AssignmentService.getAssignment(id, signal);
      return assignmentDataDTOSchema.parse(data);
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes (details are relatively stable)
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
}
