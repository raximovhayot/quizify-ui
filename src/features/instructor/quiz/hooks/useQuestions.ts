import { useQuestions as useQuestionsBase } from '@/lib/api/hooks/questions';

import type { QuestionFilter } from '../types/question';

/**
 * Feature-specific wrapper around centralized useQuestions hook
 */
export function useQuestions(filter: QuestionFilter) {
  const quizId = filter?.quizId;
  
  return useQuestionsBase(quizId!, !!quizId);
}

// Re-exports for backward compatibility after splitting hooks into separate files
export { useCreateQuestion } from './useCreateQuestion';
export { useUpdateQuestion } from './useUpdateQuestion';
export { useDeleteQuestion } from './useDeleteQuestion';
