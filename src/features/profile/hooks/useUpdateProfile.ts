import { useTranslations } from 'next-intl';

import { profileKeys } from '@/features/profile/keys';
import { AccountService } from '@/features/profile/services/accountService';
import type { AccountDTO } from '@/features/profile/types/account';
import { createMutation } from '@/lib/mutation-utils';
import type { IApiResponse } from '@/types/api';

export function useUpdateProfile() {
  const t = useTranslations();

  return createMutation<AccountDTO, Partial<AccountDTO>>({
    mutationFn: async (
      data: Partial<AccountDTO>
    ): Promise<IApiResponse<AccountDTO>> => {
      return AccountService.updateProfile(data);
    },
    successMessage: t('profile.update.success', {
      fallback: 'Profile updated successfully',
    }),
    invalidateQueries: [profileKeys.me()],
  })();
}
