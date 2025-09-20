import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { AccountService } from '@/components/features/profile/services/accountService';
import type { AccountDTO } from '@/components/features/profile/types/account';

import { profileKeys } from './useProfile';

export function useUpdateProfile() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: async (data: Partial<AccountDTO>) => {
      if (!session?.accessToken) throw new Error('No access token available');
      return AccountService.updateProfile(data, session.accessToken);
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.me() });
      const prev = queryClient.getQueryData<AccountDTO>(profileKeys.me());
      if (prev) {
        queryClient.setQueryData<AccountDTO>(profileKeys.me(), {
          ...prev,
          ...newData,
        });
      }
      return { prev };
    },
    onSuccess: (data) => {
      queryClient.setQueryData<AccountDTO>(profileKeys.me(), data);
      toast.success(
        t('profile.update.success', {
          fallback: 'Profile updated successfully',
        })
      );
    },
    onError: (error, _variables, context) => {
      if (context?.prev) {
        queryClient.setQueryData<AccountDTO>(profileKeys.me(), context.prev);
      }
      console.error(error);
      toast.error(
        t('profile.update.error', { fallback: 'Failed to update profile' })
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    },
  });
}
