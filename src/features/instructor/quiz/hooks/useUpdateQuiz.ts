import { useQueryClient } from '@tanstack/react-query';

import { useTranslations } from 'next-intl';

import { quizKeys } from '@/features/instructor/quiz/keys';
import { createMutation } from '@/lib/mutation-utils';

import { quizDataDTOSchema } from '../schemas/quizSchema';
import { QuizService } from '../services/quizService';
import { InstructorQuizUpdateRequest, QuizDataDTO } from '../types/quiz';

// Hook for updating quiz
export function useUpdateQuiz() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return createMutation<QuizDataDTO, InstructorQuizUpdateRequest>({
    mutationFn: async (data) => {
      if (!data.id) {
        throw new Error('Quiz ID is required for update');
      }
      const updated = await QuizService.updateQuiz(data.id, data);
      return { data: updated, errors: [] };
    },
    successMessage: t('instructor.quiz.update.success', {
      fallback: 'Quiz updated successfully',
    }),
    invalidateQueries: [quizKeys.lists()],
    onSuccess: (data) => {
      // Validate and update detail cache
      const validated = quizDataDTOSchema.parse(data);
      queryClient.setQueryData(quizKeys.detail(validated.id), validated);
    },
  })();
}
