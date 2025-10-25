import { useQuery } from '@tanstack/react-query';

import { assignmentKeys } from '../keys';
import { AssignmentService } from '../services/assignmentService';
import { StudentRegistration } from '../types/analytics';

/**
 * useStudentRegistrations — fetch student registrations for an assignment
 * Lists all students registered for the assignment with their attempt history
 */
export function useStudentRegistrations(assignmentId: number) {
  return useQuery<StudentRegistration[]>({
    queryKey: assignmentKeys.registrations(assignmentId),
    queryFn: ({ signal }) => AssignmentService.getStudentRegistrations(assignmentId, signal),
    enabled: !!assignmentId,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 15 * 60 * 1000, // 15 minutes
    structuralSharing: true,
  });
}
