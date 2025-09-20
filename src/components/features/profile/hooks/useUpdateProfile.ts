import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { AccountService } from '@/components/features/profile/services/accountService';
import type { AccountDTO } from '@/components/features/profile/types/account';
import { createMutation } from '@/lib/mutation-utils';
import type { IApiResponse } from '@/types/api';

import { profileKeys } from './useProfile';

export function useUpdateProfile() {
  const { data: session } = useSession();
  const t = useTranslations();

  return createMutation<AccountDTO, Partial<AccountDTO>>({
    mutationFn: async (
      data: Partial<AccountDTO>
    ): Promise<IApiResponse<AccountDTO>> => {
      if (!session?.accessToken) {
        return {
          data: null as unknown as AccountDTO,
          errors: [
            {
              code: 'AUTH_NO_TOKEN',
              message: t('auth.error.noToken', {
                default: 'No access token available',
              }),
            },
          ],
        };
      }
      return AccountService.updateProfile(data);
    },
    successMessage: t('profile.update.success', {
      fallback: 'Profile updated successfully',
    }),
    invalidateQueries: [profileKeys.me() as unknown as string[]],
  });
}
