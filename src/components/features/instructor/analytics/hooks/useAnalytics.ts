import { useQuery } from '@tanstack/react-query';

import { analyticsKeys } from '../keys';
import { AnalyticsService } from '../services/analyticsService';

/**
 * Hook to get assignment analytics overview
 */
export function useAssignmentAnalytics(assignmentId: number) {
  return useQuery({
    queryKey: analyticsKeys.assignment(assignmentId),
    queryFn: ({ signal }) =>
      AnalyticsService.getAssignmentAnalytics(assignmentId, signal),
    enabled: !!assignmentId,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 15 * 60 * 1000, // 15 minutes
    structuralSharing: true,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to get question-level analytics
 */
export function useQuestionAnalytics(assignmentId: number) {
  return useQuery({
    queryKey: analyticsKeys.questions(assignmentId),
    queryFn: ({ signal }) =>
      AnalyticsService.getQuestionAnalytics(assignmentId, signal),
    enabled: !!assignmentId,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 15 * 60 * 1000, // 15 minutes
    structuralSharing: true,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook to get student registrations
 */
export function useStudentRegistrations(assignmentId: number) {
  return useQuery({
    queryKey: analyticsKeys.registrations(assignmentId),
    queryFn: ({ signal }) =>
      AnalyticsService.getStudentRegistrations(assignmentId, signal),
    enabled: !!assignmentId,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 15 * 60 * 1000, // 15 minutes
    structuralSharing: true,
    placeholderData: (previousData) => previousData,
  });
}
