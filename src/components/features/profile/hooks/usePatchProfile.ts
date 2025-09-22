import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { profileKeys } from '@/components/features/profile/keys';
import { AccountService } from '@/components/features/profile/services/accountService';
import type { AccountDTO } from '@/components/features/profile/types/account';
import { handleApiResponse, showSuccessToast } from '@/lib/api-utils';
import { BackendError } from '@/types/api';

interface PatchProfileContext {
  previousProfile?: AccountDTO;
}

export function usePatchProfile() {
  const t = useTranslations();
  const { data: session, update: updateSession } = useSession();
  const queryClient = useQueryClient();

  return useMutation<
    AccountDTO,
    BackendError,
    Partial<AccountDTO>,
    PatchProfileContext
  >({
    mutationFn: async (data: Partial<AccountDTO>) => {
      const response = await AccountService.patchProfile(data);
      return handleApiResponse(response);
    },
    onMutate: async (variables) => {
      // Optimistic updates for language changes
      if (variables.language && session?.user) {
        // Update localStorage and cookies immediately for language changes
        localStorage.setItem('preferredLanguage', variables.language);
        document.cookie = `preferredLanguage=${variables.language}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;

        // Optimistically update the session
        try {
          await updateSession({
            ...session,
            user: {
              ...session.user,
              language: variables.language,
            },
          });
        } catch (error) {
          console.error('Error updating session optimistically:', error);
        }

        // Optimistically update the profile query cache
        const profileQueryKey = profileKeys.me();
        const previousProfile =
          queryClient.getQueryData<AccountDTO>(profileQueryKey);

        if (previousProfile) {
          queryClient.setQueryData<AccountDTO>(profileQueryKey, {
            ...previousProfile,
            language: variables.language,
          });
        }

        // Return context for potential rollback
        return { previousProfile };
      }
    },
    onError: (_error, variables, context) => {
      // Rollback optimistic updates on error
      if (variables.language && context?.previousProfile) {
        const profileQueryKey = profileKeys.me();
        queryClient.setQueryData(profileQueryKey, context.previousProfile);
      }
    },
    onSuccess: async (_data, variables) => {
      // Show success message
      showSuccessToast(
        t('profile.patch.success', {
          fallback: 'Profile updated successfully',
        })
      );

      // Invalidate and refetch profile data to ensure consistency
      await queryClient.invalidateQueries({ queryKey: profileKeys.me() });

      // For language changes, reload the page to apply new translations
      if (variables.language) {
        // Small delay to ensure the success toast is visible
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    },
  });
}
