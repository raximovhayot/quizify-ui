import { useTranslations } from 'next-intl';

import { QuizDataDTO } from '@/components/features/instructor/quiz/types/quiz';
import { studentHomeKeys } from '@/components/features/student/home/keys';
import { StudentQuizService } from '@/components/features/student/quiz/services/studentQuizService';
import { createMutation } from '@/lib/mutation-utils';
import type { IApiResponse } from '@/types/api';

type JoinResponse = { quizId?: number } | QuizDataDTO;

export function useJoinQuiz() {
  const t = useTranslations();

  return createMutation<JoinResponse, { code: string }>({
    mutationFn: async ({ code }): Promise<IApiResponse<JoinResponse>> => {
      return StudentQuizService.joinWithCode(code);
    },
    successMessage: t('student.join.success', {
      fallback: 'Joined quiz successfully',
    }),
    invalidateQueries: [
      studentHomeKeys.upcoming(),
      studentHomeKeys.inProgress(),
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
