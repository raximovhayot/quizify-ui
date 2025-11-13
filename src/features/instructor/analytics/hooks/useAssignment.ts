import { useQuery } from '@tanstack/react-query';

import { assignmentKeys } from '../keys';
import { useAssignment as useAssignmentBase } from '@/lib/api/hooks/assignments';
import { AssignmentDTO } from '../types/assignment';

/**
 * useAssignment — fetch single assignment details by id
 * Delegates to centralized hook with analytics-specific query options
 */
export function useAssignment(id: number) {
  return useAssignmentBase(id, {
    staleTime: 2 * 60 * 1000, // 2 minutes (details are relatively stable)
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
}
