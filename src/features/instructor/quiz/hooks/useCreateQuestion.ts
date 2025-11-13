import { useQueryClient } from '@tanstack:react-query';
import { useTranslations } from 'next-intl';

import { questionKeys } from '@/features/instructor/quiz/keys';
import { useCreateQuestion as useCreateQuestionBase } from '@/lib/api/hooks/questions';

import type { InstructorQuestionSaveRequest } from '../types/question';

export function useCreateQuestion() {
  const t = useTranslations();
  const qc = useQueryClient();
  const baseCreateQuestion = useCreateQuestionBase();

  return {
    ...baseCreateQuestion,
    mutateAsync: async (data: InstructorQuestionSaveRequest) => {
      const dto = await baseCreateQuestion.mutateAsync(data);
      
      // Prime detail cache for newly created question
      if (dto?.id && data?.quizId) {
        qc.setQueryData(questionKeys.detail(data.quizId, dto.id), dto);
      }
      
      return dto;
    },
  };
}
