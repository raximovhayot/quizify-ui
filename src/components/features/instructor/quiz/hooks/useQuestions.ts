import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { questionKeys } from '@/components/features/instructor/quiz/keys';
import { createMutation } from '@/lib/mutation-utils';
import { IPageableList } from '@/types/common';

import { QuestionService } from '../services/questionService';
import {
  InstructorQuestionSaveRequest,
  QuestionDataDto,
  QuestionFilter,
} from '../types/question';

export function useQuestions(filter: QuestionFilter) {
  const { status } = useSession();
  return useQuery<IPageableList<QuestionDataDto>>({
    queryKey: questionKeys.list(filter),
    queryFn: async ({ signal }) => {
      return QuestionService.getQuestions(filter, signal);
    },
    enabled: status === 'authenticated' && !!filter?.quizId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCreateQuestion() {
  const t = useTranslations();
  const queryClient = useQueryClient();

  return createMutation<QuestionDataDto, InstructorQuestionSaveRequest>({
    mutationFn: async (data) => {
      const res = await QuestionService.createQuestion(data);
      return res;
    },
    successMessage: t('instructor.quiz.question.create.success', {
      fallback: 'Question created successfully',
    }),
    invalidateQueries: [questionKeys.lists()],
    onSuccess: () => {
      // Additional cache seeding can be added here if needed
      // For now, invalidation handles refetch
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
    },
  })();
}
