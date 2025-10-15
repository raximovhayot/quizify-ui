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
      const dto = await QuestionService.createQuestion(data);
      return { data: dto, errors: [] };
    },
    successMessage: t('common.entities.question.createSuccess', {
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

export function useUpdateQuestion() {
  const t = useTranslations();
  const queryClient = useQueryClient();

  return createMutation<
    QuestionDataDto,
    { questionId: number; data: InstructorQuestionSaveRequest }
  >({
    mutationFn: async ({ questionId, data }) => {
      const dto = await QuestionService.updateQuestion(questionId, data);
      return { data: dto, errors: [] };
    },
    successMessage: t('common.entities.question.updateSuccess', {
      fallback: 'Question updated successfully',
    }),
    invalidateQueries: [questionKeys.lists()],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
    },
  })();
}

export function useDeleteQuestion() {
  const t = useTranslations();
  const queryClient = useQueryClient();

  return createMutation<void, { quizId: number; questionId: number }>({
    mutationFn: async ({ quizId, questionId }) => {
      await QuestionService.deleteQuestion(quizId, questionId);
      return { data: undefined, errors: [] } as const;
    },
    successMessage: t('common.entities.question.deleteSuccess', {
      fallback: 'Question deleted successfully',
    }),
    invalidateQueries: [questionKeys.lists()],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
    },
  })();
}
