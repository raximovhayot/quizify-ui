import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { QuizDataDTO } from '@/components/features/instructor/quiz/types/quiz';
import { StudentQuizService } from '@/components/features/student/quiz/services/studentQuizService';
import { createMutation } from '@/lib/mutation-utils';
import type { IApiResponse } from '@/types/api';

type JoinResponse = { quizId?: number } | QuizDataDTO;

export function useJoinQuiz() {
  const { data: session } = useSession();
  const t = useTranslations();

  return createMutation<JoinResponse, { code: string }>({
    mutationFn: async ({ code }): Promise<IApiResponse<JoinResponse>> => {
      if (!session?.accessToken) {
        return {
          data: { quizId: undefined } as JoinResponse,
          errors: [
            {
              code: 'AUTH_NO_TOKEN',
              message: t('auth.error.noToken', {
                default: 'No access token available',
              }),
            },
          ],
        };
      }
      return StudentQuizService.joinWithCode(code);
    },
    successMessage: t('student.join.success', {
      fallback: 'Joined quiz successfully',
    }),
    invalidateQueries: [
      ['student', 'quizzes', 'upcoming'],
      ['student', 'quizzes', 'in-progress'],
    ],
    redirectTo: (data) => {
      let quizId: number | undefined;
      const maybeQuiz = data as QuizDataDTO;
      const maybeJoin = data as { quizId?: number };
      if (typeof maybeQuiz?.id === 'number') quizId = maybeQuiz.id;
      if (!quizId && typeof maybeJoin?.quizId === 'number')
        quizId = maybeJoin.quizId;
      return `/student/quizzes/${quizId ?? ''}`;
    },
  })();
}
