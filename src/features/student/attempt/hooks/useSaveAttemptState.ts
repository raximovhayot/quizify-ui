import { useTranslations } from 'next-intl';

import { createMutation } from '@/lib/mutation-utils';
import { StudentAttemptService } from '@/features/student/history/services/studentAttemptService';
import { AttemptSaveStateRequest } from '@/features/student/history/schemas/attemptSchema';
import type { IApiResponse } from '@/types/api';

export function useSaveAttemptState() {
  const t = useTranslations();

  return createMutation<number, AttemptSaveStateRequest>({
    mutationFn: async (payload): Promise<IApiResponse<number>> => {
      const attemptId = await StudentAttemptService.saveState(payload);
      return { data: attemptId, errors: [] };
    },
    // Autosave should be quiet by default; avoid toast noise
    showSuccessToast: false,
    successMessage: t('student.attempt.saved', { fallback: 'Saved' }),
  })();
}
