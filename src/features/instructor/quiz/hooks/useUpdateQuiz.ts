import { useUpdateQuiz as useUpdateQuizBase } from '@/lib/api/hooks/quizzes';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { quizKeys } from '@/features/instructor/quiz/keys';
import { quizDataDTOSchema } from '../schemas/quizSchema';
import type { InstructorQuizUpdateRequest, QuizDataDTO } from '../types/quiz';

/**
 * Feature-specific wrapper around centralized useUpdateQuiz hook
 * Adds translations and custom cache management
 */
export function useUpdateQuiz() {
  const queryClient = useQueryClient();
  const t = useTranslations();
  const baseUpdate = useUpdateQuizBase();

  return {
    ...baseUpdate,
    mutate: (data: InstructorQuizUpdateRequest, options?: any) => {
      if (!data.id) {
        throw new Error('Quiz ID is required for update');
      }

      baseUpdate.mutate(
        { id: data.id, data },
        {
          ...options,
          onSuccess: (result, variables, context) => {
            // Validate and update detail cache
            const validated = quizDataDTOSchema.parse(result);
            queryClient.setQueryData(quizKeys.detail(validated.id), validated);
            
            toast.success(
              t('instructor.quiz.update.success', {
                fallback: 'Quiz updated successfully',
              })
            );
            
            options?.onSuccess?.(result, variables, context);
          },
        }
      );
    },
    mutateAsync: async (data: InstructorQuizUpdateRequest) => {
      if (!data.id) {
        throw new Error('Quiz ID is required for update');
      }

      const result = await baseUpdate.mutateAsync({ id: data.id, data });
      
      // Validate and update detail cache
      const validated = quizDataDTOSchema.parse(result);
      queryClient.setQueryData(quizKeys.detail(validated.id), validated);
      
      return validated as QuizDataDTO;
    },
  };
}
