import { useQueryClient } from '@tanstack/react-query';

import { useTranslations } from 'next-intl';

import { quizKeys } from '@/components/features/instructor/quiz/keys';
import { createMutation } from '@/lib/mutation-utils';

import { quizDataDTOSchema } from '../schemas/quizSchema';
import { QuizService } from '../services/quizService';
import { InstructorQuizCreateRequest, QuizDataDTO } from '../types/quiz';

// Hook for creating quiz
export function useCreateQuiz() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return createMutation<QuizDataDTO, InstructorQuizCreateRequest>({
    mutationFn: async (data) => {
      const created = await QuizService.createQuiz(data);
      return { data: created, errors: [] };
    },
    successMessage: t('instructor.quiz.create.success', {
      fallback: 'Quiz created successfully',
    }),
    invalidateQueries: [quizKeys.lists()],
    onSuccess: (data) => {
      // Validate with Zod and prime detail cache
      const validated = quizDataDTOSchema.parse(data);
      queryClient.setQueryData(quizKeys.detail(validated.id), validated);
    },
  })();
}
