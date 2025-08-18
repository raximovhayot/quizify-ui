import { useQuery } from '@tanstack/react-query';

import { useSession } from 'next-auth/react';

import { IPageableList } from '@/types/common';

import { AssignmentService } from '../services/assignmentService';
import { AssignmentDTO, AssignmentFilter } from '../types/assignment';

export const assignmentKeys = {
  all: ['assignments'] as const,
  list: (filter: AssignmentFilter) =>
    [...assignmentKeys.all, 'list', filter] as const,
};

export function useAssignments(filter: AssignmentFilter = {}) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: assignmentKeys.list(filter),
    queryFn: async ({ signal }): Promise<IPageableList<AssignmentDTO>> => {
      if (!session?.accessToken) throw new Error('No access token available');
      return AssignmentService.getAssignments(
        filter,
        session.accessToken,
        signal
      );
    },
    enabled: !!session?.accessToken,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
