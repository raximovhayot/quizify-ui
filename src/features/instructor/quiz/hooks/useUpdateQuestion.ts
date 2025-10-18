import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { questionKeys } from '@/features/instructor/quiz/keys';
import { createMutation } from '@/lib/mutation-utils';

import { QuestionService } from '../services/questionService';
import type { InstructorQuestionSaveRequest, QuestionDataDto } from '../types/question';

export function useUpdateQuestion() {
  const t = useTranslations();
  const qc = useQueryClient();

  return createMutation<
    QuestionDataDto,
    { questionId: number; data: InstructorQuestionSaveRequest }
  >({
    mutationFn: async ({ questionId, data }) => {
      const dto = await QuestionService.updateQuestion(questionId, data);
      return { data: dto, errors: [] };
    },
    successMessage: t('common.entities.question.updateSuccess', {
      fallback: 'Question updated successfully',
    }),
    invalidateQueries: [questionKeys.lists(), questionKeys.details()],
    onSuccess: async (dto, { questionId, data }) => {
      // Keep detail cache in sync for the edited question
      if (data?.quizId && questionId) {
        qc.setQueryData(questionKeys.detail(data.quizId, questionId), dto);
      }
    },
  })();
}
