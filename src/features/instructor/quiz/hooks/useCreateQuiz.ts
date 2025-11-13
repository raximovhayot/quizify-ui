import { useCreateQuiz as useCreateQuizBase } from '@/lib/api/hooks/quizzes';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { quizKeys } from '@/features/instructor/quiz/keys';
import { quizDataDTOSchema } from '../schemas/quizSchema';
import type { InstructorQuizCreateRequest, QuizDataDTO } from '../types/quiz';

/**
 * Feature-specific wrapper around centralized useCreateQuiz hook
 * Adds translations and custom cache management
 */
export function useCreateQuiz() {
  const queryClient = useQueryClient();
  const t = useTranslations();
  const baseCreate = useCreateQuizBase();

  return {
    ...baseCreate,
    mutate: (data: InstructorQuizCreateRequest, options?: any) => {
      baseCreate.mutate(data, {
        ...options,
        onSuccess: (result, variables, context) => {
          // Validate with Zod and prime detail cache
          const validated = quizDataDTOSchema.parse(result);
          queryClient.setQueryData(quizKeys.detail(validated.id), validated);
          
          // Show translated success message
          toast.success(
            t('instructor.quiz.create.success', {
              fallback: 'Quiz created successfully',
            })
          );
          
          options?.onSuccess?.(result, variables, context);
        },
      });
    },
    mutateAsync: async (data: InstructorQuizCreateRequest) => {
      const result = await baseCreate.mutateAsync(data);
      
      // Validate with Zod and prime detail cache
      const validated = quizDataDTOSchema.parse(result);
      queryClient.setQueryData(quizKeys.detail(validated.id), validated);
      
      return validated as QuizDataDTO;
    },
  };
}
