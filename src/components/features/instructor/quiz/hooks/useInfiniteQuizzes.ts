import { useInfiniteQuery } from '@tanstack/react-query';

import { useSession } from 'next-auth/react';

import { IPageableList } from '@/types/common';

import { QuizService } from '../services/quizService';
import { QuizDataDTO, QuizFilter } from '../types/quiz';

export function useInfiniteQuizzes(filter: Omit<QuizFilter, 'page'> = {}) {
  const { data: session } = useSession();

  return useInfiniteQuery({
    queryKey: ['quizzes', 'infinite', filter],
    queryFn: async ({
      pageParam = 0,
      signal,
    }): Promise<IPageableList<QuizDataDTO>> => {
      if (!session?.accessToken) {
        throw new Error('No access token available');
      }

      const response = await QuizService.getQuizzes(
        { ...filter, page: pageParam },
        session.accessToken,
        signal
      );

      // Return response directly (validation handled by services layer)
      return response;
    },
    enabled: !!session?.accessToken,
    getNextPageParam: (lastPage) => {
      // Return next page number if there are more pages
      if (lastPage.page < lastPage.totalPages - 1) {
        return lastPage.page + 1;
      }
      return undefined; // No more pages
    },
    initialPageParam: 0,
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter for infinite queries)
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Prevent aggressive refetching
    maxPages: 10, // Limit to prevent memory issues
  });
}
