import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { questionKeys } from '@/features/instructor/quiz/keys';
import { useUpdateQuestion as useUpdateQuestionBase } from '@/lib/api/hooks/questions';

import type { InstructorQuestionSaveRequest } from '../types/question';

export function useUpdateQuestion() {
  const t = useTranslations();
  const qc = useQueryClient();
  const baseUpdateQuestion = useUpdateQuestionBase();

  return {
    ...baseUpdateQuestion,
    mutateAsync: async ({ questionId, data }: { questionId: number; data: InstructorQuestionSaveRequest }) => {
      const dto = await baseUpdateQuestion.mutateAsync({ questionId, data });
      
      // Keep detail cache in sync for the edited question
      if (data?.quizId && questionId) {
        qc.setQueryData(questionKeys.detail(data.quizId, questionId), dto);
      }
      
      return dto;
    },
  };
}
