import { useQuiz as useQuizBase } from '@/lib/api/hooks/quizzes';

import { quizDataDTOSchema } from '../schemas/quizSchema';
import type { QuizDataDTO } from '../types/quiz';

/**
 * Feature-specific wrapper around centralized useQuiz hook
 * Adds Zod validation
 */
export function useQuiz(quizId: number) {
  const result = useQuizBase(quizId, !!quizId);

  return {
    ...result,
    data: result.data ? quizDataDTOSchema.parse(result.data) as QuizDataDTO : undefined,
  };
}
