import { useQuery } from '@tanstack/react-query';

import { quizKeys } from '@/components/features/instructor/quiz/keys';

import { QuizService } from '../services/quizService';
import { QuizFilter } from '../types/quiz';

export function useQuizzes(filter: QuizFilter = {}) {
  return useQuery({
    queryKey: quizKeys.list(filter),
    queryFn: async ({ signal }) => {
      return QuizService.getQuizzes(filter, signal);
    },
    staleTime: 60 * 1000, // 1 minute (more responsive)
    gcTime: 15 * 60 * 1000, // 15 minutes (keep longer in cache)
    structuralSharing: true,
    // Keep showing previous data while refetching for better UX
    placeholderData: (previousData) => previousData,
  });
}
