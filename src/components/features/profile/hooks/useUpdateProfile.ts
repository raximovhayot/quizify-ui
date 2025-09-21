import { useTranslations } from 'next-intl';

import { profileKeys } from '@/components/features/profile/keys';
import { AccountService } from '@/components/features/profile/services/accountService';
import type { AccountDTO } from '@/components/features/profile/types/account';
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
