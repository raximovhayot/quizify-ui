import { useQuery } from '@tanstack/react-query';

import { assignmentKeys } from '../keys';
import { AssignmentService } from '../services/assignmentService';
import { AssignmentAnalytics } from '../types/analytics';

/**
 * useAssignmentAnalytics — fetch assignment analytics overview
 * Fetches comprehensive analytics data for an assignment including attempts and scores
 */
export function useAssignmentAnalytics(assignmentId: number) {
  return useQuery<AssignmentAnalytics>({
    queryKey: assignmentKeys.analytics(assignmentId),
    queryFn: ({ signal }) =>
      AssignmentService.getAssignmentAnalytics(assignmentId, signal),
    enabled: !!assignmentId,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 15 * 60 * 1000, // 15 minutes
    structuralSharing: true,
  });
}
