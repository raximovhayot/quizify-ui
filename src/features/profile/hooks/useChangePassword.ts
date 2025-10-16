import { useTranslations } from 'next-intl';

import { AccountService } from '@/features/profile/services/accountService';
import type { UpdatePasswordRequest } from '@/features/profile/types/account';
import { createMutation } from '@/lib/mutation-utils';
import type { IApiResponse } from '@/types/api';

export function useChangePassword() {
  const t = useTranslations();

  return createMutation<string, UpdatePasswordRequest>({
    mutationFn: async (
      data: UpdatePasswordRequest
    ): Promise<IApiResponse<string>> => {
      return AccountService.changePassword(data);
    },
    successMessage: t('profile.password.success', {
      fallback: 'Password updated successfully',
    }),
  })();
}
