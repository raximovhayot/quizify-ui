import { useQuery } from '@tanstack/react-query';

import { useSession } from 'next-auth/react';

import { StudentAttemptService } from '@/components/features/student/history/services/studentAttemptService';
import { StudentAttemptDTO } from '@/components/features/student/quiz/types/attempt';
import { IPageableList } from '@/types/common';

export const attemptHistoryKeys = {
  all: ['student', 'attempts'] as const,
  history: (status?: string, page?: number, size?: number) =>
    [
      ...attemptHistoryKeys.all,
      'history',
      { status: status || '', page: page ?? 0, size: size ?? 10 },
    ] as const,
};

export interface AttemptHistoryFilter {
  status?: 'passed' | 'failed' | 'in_progress' | 'completed' | '';
  page?: number; // zero-based
  size?: number;
}

export function useAttemptHistory(filter: AttemptHistoryFilter = {}) {
  const { data: session } = useSession();
  const status =
    filter.status && filter.status.length > 0 ? filter.status : undefined;
  const page = filter.page ?? 0;
  const size = filter.size ?? 10;

  return useQuery<IPageableList<StudentAttemptDTO>>({
    queryKey: attemptHistoryKeys.history(status, page, size),
    queryFn: async ({ signal }) => {
      if (!session?.accessToken) throw new Error('No access token available');
      return StudentAttemptService.getAttempts(signal, {
        status,
        page,
        size,
      });
    },
    enabled: !!session?.accessToken,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}
