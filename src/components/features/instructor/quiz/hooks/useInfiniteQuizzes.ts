import { useInfiniteQuery } from '@tanstack/react-query';

import { useSession } from 'next-auth/react';

import { IPageableList } from '@/types/common';

import { quizKeys } from '../keys';
import { QuizService } from '../services/quizService';
import { QuizDataDTO, QuizFilter } from '../types/quiz';

export function useInfiniteQuizzes(filter: Omit<QuizFilter, 'page'> = {}) {
  const { status } = useSession();

  return useInfiniteQuery({
    queryKey: quizKeys.infinite(filter),
    queryFn: async ({
      pageParam = 0,
      signal,
    }): Promise<IPageableList<QuizDataDTO>> => {
      const response = await QuizService.getQuizzes(
        { ...filter, page: pageParam },
        signal
      );

      // Return response directly (validation handled by services layer)
      return response;
    },
    enabled: status === 'authenticated',
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
