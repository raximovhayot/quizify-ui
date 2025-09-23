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
      const profile = await AccountService.getProfile(signal);

      return profile;
    },
    enabled: status === 'authenticated',
    staleTime: 2 * 60_000,
    gcTime: 10 * 60_000,
    placeholderData: (prev) => prev,
  });
}
