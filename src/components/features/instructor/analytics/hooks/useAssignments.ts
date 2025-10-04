import { useQuery } from '@tanstack/react-query';

import { IPageableList } from '@/types/common';

import { assignmentKeys } from '../keys';
import { AssignmentService } from '../services/assignmentService';
import { AssignmentDTO, AssignmentFilter } from '../types/assignment';

export function useAssignments(filter: AssignmentFilter = {}) {
  return useQuery({
    queryKey: assignmentKeys.list(filter),
    queryFn: async ({ signal }): Promise<IPageableList<AssignmentDTO>> => {
      return AssignmentService.getAssignments(filter, signal);
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 15 * 60 * 1000, // 15 minutes
    structuralSharing: true,
    placeholderData: (previousData) => previousData,
  });
}
