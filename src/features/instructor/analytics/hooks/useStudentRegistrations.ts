import { useQuery } from '@tanstack/react-query';

import { assignmentKeys } from '../keys';
import { StudentRegistration } from '../types/analytics';

/**
 * useStudentRegistrations — fetch student registrations for an assignment
 * Lists all students registered for the assignment with their attempt history
 * 
 * TODO: Add this endpoint to centralized API when backend implements it
 */
export function useStudentRegistrations(assignmentId: number) {
  return useQuery<StudentRegistration[]>({
    queryKey: assignmentKeys.registrations(assignmentId),
    queryFn: async () => {
      // Stub: Return empty array until endpoint is implemented
      return [];
    },
    enabled: !!assignmentId,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 15 * 60 * 1000, // 15 minutes
    structuralSharing: true,
  });
}
