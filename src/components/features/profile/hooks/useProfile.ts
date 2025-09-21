import { useQuery } from '@tanstack/react-query';

import { useSession } from 'next-auth/react';

import { profileKeys } from '@/components/features/profile/keys';
import { AccountService } from '@/components/features/profile/services/accountService';
import type { AccountDTO } from '@/components/features/profile/types/account';

export function useProfile() {
  const { status } = useSession();

  return useQuery<AccountDTO>({
    queryKey: profileKeys.me(),
    queryFn: async ({ signal }) => {
      return AccountService.getProfile(signal);
    },
    enabled: status === 'authenticated',
    staleTime: 2 * 60_000,
    gcTime: 10 * 60_000,
    placeholderData: (prev) => prev,
  });
}
