import { useQuery } from '@tanstack/react-query';

import { IPageableList } from '@/types/common';

import { assignmentKeys } from '../keys';
import {
  assignmentDataDTOSchema,
  assignmentListResponseSchema,
} from '../schemas/assignmentSchema';
import { AssignmentService } from '../services/assignmentService';
import { AssignmentDTO, AssignmentFilter } from '../types/assignment';

/**
 * useAssignments — fetch paginated assignments list (instructor analytics)
 * Mirrors quiz hooks patterns: session-gated, sensible cache times, stable keys.
 */
export function useAssignments(filter: AssignmentFilter = {}) {
  return useQuery<IPageableList<AssignmentDTO>>({
    queryKey: assignmentKeys.list(filter),
    queryFn: async ({ signal }) => {
      const data = await AssignmentService.getAssignments(filter, signal);
      // Validate defensively at hook boundary as well
      return assignmentListResponseSchema.parse(data);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
