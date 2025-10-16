import { useTranslations } from 'next-intl';

import { createMutation } from '@/lib/mutation-utils';
import { StudentAttemptService } from '@/features/student/history/services/studentAttemptService';
import type { IApiResponse } from '@/types/api';

export function useCompleteAttempt() {
  const t = useTranslations();

  return createMutation<number, { attemptId: number }>({
    mutationFn: async ({ attemptId }): Promise<IApiResponse<number>> => {
      const id = await StudentAttemptService.complete(attemptId);
      return { data: id, errors: [] };
    },
    successMessage: t('student.attempt.completed', { fallback: 'Attempt completed' }),
    // For now, go back to student home; can be changed to summary page when available
    redirectTo: '/student',
    invalidateQueries: [['student', 'attempts']],
  })();
}
