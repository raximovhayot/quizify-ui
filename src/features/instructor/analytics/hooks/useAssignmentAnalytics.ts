import { useQuery } from '@tanstack/react-query';
import { assignmentKeys } from '../keys';
import { assignmentsApi } from '@/lib/api/endpoints/assignments';

/**
 * useAssignmentAnalytics — fetch analytics overview for an assignment
 * Provides comprehensive statistics including scores, attempts, and student performance
 */
export function useAssignmentAnalytics(assignmentId: number) {
  return useQuery({
    queryKey: assignmentKeys.analytics(assignmentId),
    queryFn: () => assignmentsApi.getAnalytics(assignmentId),
    enabled: !!assignmentId,
    staleTime: 30 * 1000, // 30 seconds - analytics change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    structuralSharing: true,
  });
}
