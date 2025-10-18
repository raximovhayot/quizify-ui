import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { questionKeys } from '@/features/instructor/quiz/keys';
import { createMutation } from '@/lib/mutation-utils';

import { QuestionService } from '../services/questionService';
import type { InstructorQuestionSaveRequest, QuestionDataDto } from '../types/question';

export function useCreateQuestion() {
  const t = useTranslations();
  const qc = useQueryClient();

  return createMutation<QuestionDataDto, InstructorQuestionSaveRequest>({
    mutationFn: async (data) => {
      const dto = await QuestionService.createQuestion(data);
      return { data: dto, errors: [] };
    },
    successMessage: t('common.entities.question.createSuccess', {
      fallback: 'Question created successfully',
    }),
    invalidateQueries: [questionKeys.lists(), questionKeys.details()],
    onSuccess: async (dto, variables) => {
      // Prime detail cache for newly created question
      if (dto?.id && variables?.quizId) {
        qc.setQueryData(questionKeys.detail(variables.quizId, dto.id), dto);
      }
    },
  })();
}
