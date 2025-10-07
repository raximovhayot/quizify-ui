import { useTranslations } from 'next-intl';

import { studentHomeKeys } from '@/components/features/student/home/keys';
import { StudentAssignmentService } from '@/components/features/student/assignment/services/studentAssignmentService';
import { createMutation } from '@/lib/mutation-utils';
import type { IApiResponse } from '@/types/api';

export function useJoinQuiz() {
  const t = useTranslations();

  return createMutation<{ attemptId: number; assignmentId: number }, { code: string }>({
    mutationFn: async ({ code }): Promise<IApiResponse<{ attemptId: number; assignmentId: number }>> => {
      const joined = await StudentAssignmentService.join(code);
      return { data: joined, errors: [] };
    },
    successMessage: t('student.join.success', {
      fallback: 'Joined successfully',
    }),
    invalidateQueries: [
      studentHomeKeys.upcoming(),
      studentHomeKeys.inProgress(),
    ],
    // TODO: switch to attempt player route once confirmed (e.g., `/student/attempts/${data.attemptId}`)
    redirectTo: (data) => `/student`,
  })();
}
