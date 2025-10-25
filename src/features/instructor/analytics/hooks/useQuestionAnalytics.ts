import { useQuery } from '@tanstack/react-query';

import { assignmentKeys } from '../keys';
import { AssignmentService } from '../services/assignmentService';
import { QuestionAnalytics } from '../types/analytics';

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
