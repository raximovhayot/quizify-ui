import { useQuery } from '@tanstack/react-query';

import { StudentAttemptService } from '@/components/features/student/history/services/studentAttemptService';
import { AttemptFullData } from '@/components/features/student/history/schemas/attemptSchema';

export function useAttemptContent(attemptId: number) {
  return useQuery<AttemptFullData>({
    queryKey: ['student', 'attempts', 'content', attemptId],
    queryFn: async ({ signal }) => {
      return StudentAttemptService.getContent(attemptId, signal);
    },
    enabled: Number.isFinite(attemptId) && attemptId > 0,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}
