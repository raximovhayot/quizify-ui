import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { AccountService } from '@/components/features/profile/services/accountService';
import type { UpdatePasswordRequest } from '@/components/features/profile/types/account';
import { createMutation } from '@/lib/mutation-utils';
import type { IApiResponse } from '@/types/api';

export function useChangePassword() {
  const { data: session } = useSession();
  const t = useTranslations();

  return createMutation<string, UpdatePasswordRequest>({
    mutationFn: async (
      data: UpdatePasswordRequest
    ): Promise<IApiResponse<string>> => {
      if (!session?.accessToken) {
        return {
          data: '' as string,
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
      return AccountService.changePassword(data);
    },
    successMessage: t('profile.password.success', {
      fallback: 'Password updated successfully',
    }),
  });
}
