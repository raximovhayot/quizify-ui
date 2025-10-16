import { useQuery } from '@tanstack/react-query';


import { profileKeys } from '@/features/profile/keys';
import { AccountService } from '@/features/profile/services/accountService';
import type { AccountDTO } from '@/features/profile/types/account';

export function useProfile() {
  return useQuery<AccountDTO>({
    queryKey: profileKeys.me(),
    queryFn: async ({ signal }) => {
      const profile = await AccountService.getProfile(signal);

      return profile;
    },
    staleTime: 2 * 60_000,
    gcTime: 10 * 60_000,
  });
}
