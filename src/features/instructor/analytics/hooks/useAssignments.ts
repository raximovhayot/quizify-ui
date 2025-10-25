import { useQuery } from '@tanstack/react-query';

import { IPageableList } from '@/types/common';

import { assignmentKeys } from '../keys';
import {
  assignmentDataDTOSchema,
  assignmentListResponseSchema,
} from '../schemas/assignmentSchema';
import { AssignmentService } from '../services/assignmentService';
import {
  AssignmentAnalytics,
  QuestionAnalytics,
  StudentRegistration,
} from '../types/analytics';
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
  });
}

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

/**
 * useQuestionAnalytics — fetch question-level analytics for an assignment
 * Provides detailed statistics about each question's performance
 */
export function useQuestionAnalytics(assignmentId: number) {
  return useQuery<QuestionAnalytics[]>({
    queryKey: assignmentKeys.questionAnalytics(assignmentId),
    queryFn: ({ signal }) =>
      AssignmentService.getQuestionAnalytics(assignmentId, signal),
    enabled: !!assignmentId,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 15 * 60 * 1000, // 15 minutes
    structuralSharing: true,
  });
}

/**
 * useStudentRegistrations — fetch student registrations for an assignment
 * Lists all students registered for the assignment with their attempt history
 */
export function useStudentRegistrations(assignmentId: number) {
  return useQuery<StudentRegistration[]>({
    queryKey: assignmentKeys.registrations(assignmentId),
    queryFn: ({ signal }) =>
      AssignmentService.getStudentRegistrations(assignmentId, signal),
    enabled: !!assignmentId,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 15 * 60 * 1000, // 15 minutes
    structuralSharing: true,
  });
}
