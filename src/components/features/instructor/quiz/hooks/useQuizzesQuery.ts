import { useQuery } from '@tanstack/react-query';

import { useSession } from 'next-auth/react';

import { quizKeys } from '@/components/features/instructor/quiz/keys';

import {
  TQuizListResponse,
  quizListResponseSchema,
} from '../schemas/quizSchema';
import { QuizService } from '../services/quizService';
import { QuizFilter } from '../types/quiz';

// Hook for fetching paginated quizzes list
export function useQuizzes(filter: QuizFilter = {}) {
  const { status } = useSession();

  return useQuery({
    queryKey: quizKeys.list(filter),
    queryFn: async ({ signal }): Promise<TQuizListResponse> => {
      const response = await QuizService.getQuizzes(filter, signal);
      return quizListResponseSchema.parse(response);
    },
    enabled: status === 'authenticated',
    staleTime: 60 * 1000, // 1 minute (more responsive)
    gcTime: 15 * 60 * 1000, // 15 minutes (keep longer in cache)
    // Dedupe identical requests within 1 second
    structuralSharing: true,
    // Enable optimistic updates
    placeholderData: (previousData) => previousData,
  });
}
