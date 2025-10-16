import { useQuery } from '@tanstack/react-query';

import { questionKeys } from '../keys';
import { QuestionService } from '../services/questionService';
import { questionDataDtoSchema } from '../schemas/questionSchema';
import type { QuestionDataDto } from '../types/question';

/**
 * Fetch a single question by id with Zod validation.
 * Uses a composite query key [quizId, id] to avoid collisions.
 */
export function useQuestion(quizId: number | undefined, id: number | undefined) {
  return useQuery<QuestionDataDto>({
    queryKey: typeof quizId === 'number' && typeof id === 'number' ? questionKeys.detail(quizId, id) : questionKeys.details(),
    queryFn: async ({ signal }) => {
      if (typeof quizId !== 'number' || typeof id !== 'number') throw new Error('Invalid question identifiers');
      const dto = await QuestionService.getQuestion(quizId, id, signal);
      return questionDataDtoSchema.parse(dto);
    },
    enabled: typeof quizId === 'number' && typeof id === 'number',
    staleTime: 2 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });
}
