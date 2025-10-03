import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { GradingService } from '../services/gradingService';
import { GradeEssayRequest } from '../types/grading';

/**
 * Hook to get assignment grading data
 */
export function useAssignmentGrading(assignmentId: number) {
  return useQuery({
    queryKey: ['assignment-grading', assignmentId],
    queryFn: ({ signal }) =>
      GradingService.getAssignmentGrading(assignmentId, signal),
    enabled: !!assignmentId,
  });
}

/**
 * Hook to grade an essay answer
 */
export function useGradeEssay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      answerId,
      grading,
    }: {
      answerId: number;
      grading: GradeEssayRequest;
    }) => GradingService.gradeEssay(answerId, grading),
    onSuccess: () => {
      // Invalidate grading queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['assignment-grading'] });
      queryClient.invalidateQueries({ queryKey: ['assignment-analytics'] });
    },
  });
}
