import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { questionKeys } from '@/features/instructor/quiz/keys';
import { createMutation } from '@/lib/mutation-utils';

import { QuestionService } from '../services/questionService';

export function useDeleteQuestion() {
  const t = useTranslations();
  const qc = useQueryClient();

  return createMutation<void, { quizId: number; questionId: number}>({
    mutationFn: async ({ quizId, questionId }) => {
      await QuestionService.deleteQuestion(quizId, questionId);
      return { data: undefined, errors: [] } as const;
    },
    successMessage: t('common.entities.question.deleteSuccess', {
      fallback: 'Question deleted successfully',
    }),
    invalidateQueries: [questionKeys.lists(), questionKeys.details()],
    onSuccess: async (_void, { quizId, questionId }) => {
      // Drop the deleted question detail cache entry, if any
      if (quizId && questionId) {
        qc.removeQueries({ queryKey: questionKeys.detail(quizId, questionId) });
      }
    },
  })();
}
