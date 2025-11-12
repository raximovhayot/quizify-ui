import { useQuestion as useQuestionBase } from '@/lib/api/hooks/questions';

import { questionDataDtoSchema } from '../schemas/questionSchema';
import type { QuestionDataDto } from '../types/question';

/**
 * Feature-specific wrapper around centralized useQuestion hook
 * Adds Zod validation
 */
export function useQuestion(quizId: number | undefined, id: number | undefined) {
  const result = useQuestionBase(
    quizId!,
    id!,
    typeof quizId === 'number' && typeof id === 'number'
  );

  return {
    ...result,
    data: result.data ? questionDataDtoSchema.parse(result.data) as QuestionDataDto : undefined,
  };
}
