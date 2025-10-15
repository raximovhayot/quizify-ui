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
    placeholderData: (prev) => prev,
  });
}
