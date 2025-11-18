import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { questionKeys } from '@/features/instructor/quiz/keys';
import { useUpdateQuestion as useUpdateQuestionBase } from '@/lib/api/hooks/questions';
import type { QuestionUpdateRequest } from '@/lib/api/endpoints/questions';

import type { InstructorQuestionSaveRequest } from '../types/question';

export function useUpdateQuestion(quizId: number) {
  const t = useTranslations();
  const qc = useQueryClient();
  const baseUpdateQuestion = useUpdateQuestionBase(quizId);

  return {
    ...baseUpdateQuestion,
    mutateAsync: async ({ questionId, data }: { questionId: number; data: InstructorQuestionSaveRequest }) => {
      const dto = await baseUpdateQuestion.mutateAsync({ questionId, data: data as unknown as QuestionUpdateRequest });
      
      // Keep detail cache in sync for the edited question
      if (quizId && questionId) {
        qc.setQueryData(questionKeys.detail(quizId, questionId), dto);
      }
      
      return dto;
    },
  };
}
