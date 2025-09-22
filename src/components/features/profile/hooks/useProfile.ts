import { useQuery } from '@tanstack/react-query';

import { useSession } from 'next-auth/react';

import { profileKeys } from '@/components/features/profile/keys';
import { AccountService } from '@/components/features/profile/services/accountService';
import type { AccountDTO } from '@/components/features/profile/types/account';
import { DashboardType } from '@/components/features/profile/types/account';

export function useProfile() {
  const { status } = useSession();

  return useQuery<AccountDTO>({
    queryKey: profileKeys.me(),
    queryFn: async ({ signal }) => {
      const profile = await AccountService.getProfile(signal);

      // Convert backend string enum to frontend numeric enum
      if (profile.dashboardType) {
        const backendDashboardType = profile.dashboardType as unknown as string;
        if (backendDashboardType === 'STUDENT') {
          profile.dashboardType = DashboardType.STUDENT;
        } else if (backendDashboardType === 'INSTRUCTOR') {
          profile.dashboardType = DashboardType.INSTRUCTOR;
        }
      }

      return profile;
    },
    enabled: status === 'authenticated',
    staleTime: 2 * 60_000,
    gcTime: 10 * 60_000,
    placeholderData: (prev) => prev,
  });
}
