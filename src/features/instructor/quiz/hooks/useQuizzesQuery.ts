import { useQuizzes as useQuizzesBase } from '@/lib/api/hooks/quizzes';
import type { QuizListParams } from '@/lib/api/endpoints/quizzes';

import type { QuizFilter } from '../types/quiz';

/**
 * Feature-specific wrapper around centralized useQuizzes hook
 * Maps local QuizFilter type to QuizListParams
 */
export function useQuizzes(filter: QuizFilter = {}) {
  // Map filter to API params
  const params: QuizListParams = {
    page: filter.page,
    size: filter.size,
    search: filter.search,
    status: filter.status,
  };

  return useQuizzesBase(params);
}
