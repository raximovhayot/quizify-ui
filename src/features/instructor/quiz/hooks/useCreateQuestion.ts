import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { questionKeys } from '@/features/instructor/quiz/keys';
import { useCreateQuestion as useCreateQuestionBase } from '@/lib/api/hooks/questions';

import type { InstructorQuestionSaveRequest } from '../types/question';

export function useCreateQuestion(quizId: number) {
  const t = useTranslations();
  const qc = useQueryClient();
  const baseCreateQuestion = useCreateQuestionBase(quizId);

  return {
    ...baseCreateQuestion,
    mutateAsync: async (data: InstructorQuestionSaveRequest) => {
      const dto = await baseCreateQuestion.mutateAsync(data as any);
      
      // Prime detail cache for newly created question
      if (dto?.id && quizId) {
        qc.setQueryData(questionKeys.detail(quizId, dto.id), dto);
      }
      
      return dto;
    },
  };
}
