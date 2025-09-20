import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { createMutation } from '@/lib/mutation-utils';
import { IPageableList } from '@/types/common';

import { QuestionService } from '../services/questionService';
import {
  InstructorQuestionSaveRequest,
  QuestionDataDto,
  QuestionFilter,
} from '../types/question';

export const questionKeys = {
  all: ['questions'] as const,
  lists: () => [...questionKeys.all, 'list'] as const,
  list: (filter: QuestionFilter) => [...questionKeys.lists(), filter] as const,
};

export function useQuestions(filter: QuestionFilter) {
  const { data: session } = useSession();
  return useQuery<IPageableList<QuestionDataDto>>({
    queryKey: questionKeys.list(filter),
    queryFn: async ({ signal }) => {
      if (!session?.accessToken) throw new Error('No access token available');
      return QuestionService.getQuestions(filter, session.accessToken, signal);
    },
    enabled: !!session?.accessToken && !!filter?.quizId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateQuestion() {
  const { data: session } = useSession();
  const t = useTranslations();
  const queryClient = useQueryClient();

  return createMutation<QuestionDataDto, InstructorQuestionSaveRequest>({
    mutationFn: async (data) => {
      if (!session?.accessToken) {
        return {
          data: null as unknown as QuestionDataDto,
          errors: [
            {
              code: 'AUTH_NO_TOKEN',
              message: t('auth.error.noToken', {
                default: 'No access token available',
              }),
            },
          ],
        };
      }
      const res = await QuestionService.createQuestion(
        data,
        session.accessToken
      );
      return res;
    },
    successMessage: t('instructor.quiz.question.create.success', {
      fallback: 'Question created successfully',
    }),
    invalidateQueries: [questionKeys.lists() as unknown as string[]],
    onSuccess: () => {
      // Additional cache seeding can be added here if needed
      // For now, invalidation handles refetch
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
    },
  })();
}
