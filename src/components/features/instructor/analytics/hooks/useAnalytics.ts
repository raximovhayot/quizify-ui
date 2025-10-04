import { useQuery } from '@tanstack/react-query';

import { AnalyticsService } from '../services/analyticsService';

/**
 * Hook to get assignment analytics overview
 */
export function useAssignmentAnalytics(assignmentId: number) {
  return useQuery({
    queryKey: ['assignment-analytics', assignmentId],
    queryFn: ({ signal }) =>
      AnalyticsService.getAssignmentAnalytics(assignmentId, signal),
    enabled: !!assignmentId,
  });
}

/**
 * Hook to get question-level analytics
 */
export function useQuestionAnalytics(assignmentId: number) {
  return useQuery({
    queryKey: ['question-analytics', assignmentId],
    queryFn: ({ signal }) =>
      AnalyticsService.getQuestionAnalytics(assignmentId, signal),
    enabled: !!assignmentId,
  });
}

/**
 * Hook to get student registrations
 */
export function useStudentRegistrations(assignmentId: number) {
  return useQuery({
    queryKey: ['student-registrations', assignmentId],
    queryFn: ({ signal }) =>
      AnalyticsService.getStudentRegistrations(assignmentId, signal),
    enabled: !!assignmentId,
  });
}
