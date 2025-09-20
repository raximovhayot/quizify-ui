import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useState } from 'react';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { AccountService } from '@/components/features/profile/services/accountService';
import type { AccountDTO } from '@/components/features/profile/types/account';

import { profileKeys } from './useProfile';

export function useUploadAvatar() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const t = useTranslations();
  const [progress, setProgress] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      if (!session?.accessToken) throw new Error('No access token available');
      setProgress(0);
      const result = await AccountService.uploadAvatar(
        file,
        session.accessToken,
        (info) => {
          setProgress(info.percent);
        }
      );
      return result;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<AccountDTO>(profileKeys.me(), data);
      toast.success(
        t('profile.avatar.success', { fallback: 'Avatar updated successfully' })
      );
      setProgress(null);
    },
    onError: (error) => {
      console.error(error);
      toast.error(
        t('profile.avatar.error', { fallback: 'Failed to upload avatar' })
      );
      setProgress(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    },
  });

  return { ...mutation, progress };
}
