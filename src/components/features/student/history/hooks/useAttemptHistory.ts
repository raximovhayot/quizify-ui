import { useQuery } from '@tanstack/react-query';

import { useSession } from 'next-auth/react';

import { attemptHistoryKeys } from '@/components/features/student/history';
import { StudentAttemptService } from '@/components/features/student/history/services/studentAttemptService';
import {
  AttemptListingData,
  AttemptStatus,
} from '@/components/features/student/quiz/types/attempt';
import { IPageableList } from '@/types/common';

export { attemptHistoryKeys } from '@/components/features/student/history/keys';

export interface AttemptHistoryFilter {
  status?: AttemptStatus | '';
  page?: number; // zero-based
  size?: number;
}

export function useAttemptHistory(filter: AttemptHistoryFilter = {}) {
  const { status: authStatus } = useSession();
  const status =
    filter.status === '' || filter.status === undefined
      ? undefined
      : filter.status;
  const page = filter.page ?? 0;
  const size = filter.size ?? 10;

  return useQuery<IPageableList<AttemptListingData>>({
    queryKey: attemptHistoryKeys.history(String(status ?? ''), page, size),
    queryFn: async ({ signal }) => {
      return StudentAttemptService.getAttempts(signal, {
        status,
        page,
        size,
      });
    },
    enabled: authStatus === 'authenticated',
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}
