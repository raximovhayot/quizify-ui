import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

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

  return useMutation({
    mutationFn: async (
      data: InstructorQuestionSaveRequest
    ): Promise<QuestionDataDto> => {
      if (!session?.accessToken) throw new Error('No access token available');
      const res = await QuestionService.createQuestion(
        data,
        session.accessToken
      );
      return res;
    },
    onSuccess: (data) => {
      // Invalidate relevant question lists
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
      toast.success(
        t('instructor.quiz.question.create.success', {
          fallback: 'Question created successfully',
        })
      );
    },
    onError: (error) => {
      console.error('Failed to create question:', error);
      toast.error(
        t('instructor.quiz.question.create.error', {
          fallback: 'Failed to create question',
        })
      );
    },
  });
}
