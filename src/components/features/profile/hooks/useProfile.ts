import { useQuery } from '@tanstack/react-query';

import { useSession } from 'next-auth/react';

import { AccountService } from '@/components/features/profile/services/accountService';
import type { AccountDTO } from '@/components/features/profile/types/account';

export const profileKeys = {
  all: ['profile'] as const,
  me: () => [...profileKeys.all, 'me'] as const,
};

export function useProfile() {
  const { data: session } = useSession();

  return useQuery<AccountDTO>({
    queryKey: profileKeys.me(),
    queryFn: async ({ signal }) => {
      if (!session?.accessToken) throw new Error('No access token available');
      return AccountService.getProfile(session.accessToken, signal);
    },
    enabled: !!session?.accessToken,
    staleTime: 2 * 60_000,
    gcTime: 10 * 60_000,
    placeholderData: (prev) => prev,
  });
}
