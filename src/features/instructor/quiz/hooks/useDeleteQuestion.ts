import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { questionKeys } from '@/features/instructor/quiz/keys';
import { useDeleteQuestion as useDeleteQuestionBase } from '@/lib/api/hooks/questions';

export function useDeleteQuestion(quizId: number) {
  const t = useTranslations();
  const qc = useQueryClient();
  const baseDeleteQuestion = useDeleteQuestionBase(quizId);

  return {
    ...baseDeleteQuestion,
    mutateAsync: async ({ questionId }: { quizId: number; questionId: number }) => {
      await baseDeleteQuestion.mutateAsync(questionId);
      
      // Drop the deleted question detail cache entry, if any
      if (quizId && questionId) {
        qc.removeQueries({ queryKey: questionKeys.detail(quizId, questionId) });
      }
    },
  };
}
