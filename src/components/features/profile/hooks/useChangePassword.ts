import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { AccountService } from '@/components/features/profile/services/accountService';
import type { UpdatePasswordRequest } from '@/components/features/profile/types/account';

export function useChangePassword() {
  const { data: session } = useSession();
  const t = useTranslations();

  return useMutation({
    mutationFn: async (data: UpdatePasswordRequest) => {
      if (!session?.accessToken) throw new Error('No access token available');
      return AccountService.changePassword(data, session.accessToken);
    },
    onSuccess: () => {
      toast.success(
        t('profile.password.success', {
          fallback: 'Password updated successfully',
        })
      );
    },
    onError: (error) => {
      console.error(error);
      toast.error(
        t('profile.password.error', { fallback: 'Failed to update password' })
      );
    },
  });
}
