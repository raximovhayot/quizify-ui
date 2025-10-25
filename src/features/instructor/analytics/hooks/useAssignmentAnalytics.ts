import { useQuery } from '@tanstack/react-query';

import { assignmentKeys } from '../keys';
import { AssignmentService } from '../services/assignmentService';
import { AssignmentAnalytics } from '../types/analytics';

/**
 * useAssignmentAnalytics — fetch analytics overview for an assignment
 * Provides comprehensive statistics including scores, attempts, and student performance
 */
export function useAssignmentAnalytics(assignmentId: number) {
  return useQuery<AssignmentAnalytics>({
    queryKey: assignmentKeys.analytics(assignmentId),
    queryFn: ({ signal }) =>
      AssignmentService.getAssignmentAnalytics(assignmentId, signal),
    enabled: !!assignmentId,
    staleTime: 30 * 1000, // 30 seconds - analytics change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    structuralSharing: true,
  });
}
