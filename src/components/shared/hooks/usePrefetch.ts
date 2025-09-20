import { useQueryClient } from '@tanstack/react-query';

import { useCallback } from 'react';

import { useSession } from 'next-auth/react';

/**
 * Hook for prefetching data to improve perceived performance
 */
export function usePrefetch() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  // Prefetch quiz details when hovering over a quiz card
  const prefetchQuiz = useCallback(
    async (quizId: number) => {
      if (!session?.accessToken || !quizId) return;

      await queryClient.prefetchQuery({
        queryKey: ['quizzes', 'detail', quizId],
        queryFn: async () => {
          const { QuizService } = await import(
            '@/components/features/instructor/quiz/services/quizService'
          );
          return QuizService.getQuiz(quizId, session.accessToken);
        },
        staleTime: 2 * 60 * 1000,
      });
    },
    [queryClient, session?.accessToken]
  );

  // Prefetch quiz questions when viewing quiz details
  const prefetchQuestions = useCallback(
    async (quizId: number) => {
      if (!session?.accessToken || !quizId) return;

      await queryClient.prefetchQuery({
        queryKey: ['questions', 'list', { quizId }],
        queryFn: async () => {
          const { QuestionService } = await import(
            '@/components/features/instructor/quiz/services/questionService'
          );
          return QuestionService.getQuestions({ quizId }, session.accessToken);
        },
        staleTime: 2 * 60 * 1000,
      });
    },
    [queryClient, session?.accessToken]
  );

  // Prefetch user profile data
  const prefetchProfile = useCallback(async () => {
    if (!session?.accessToken) return;

    await queryClient.prefetchQuery({
      queryKey: ['profile'],
      queryFn: async () => {
        const accountServiceModule = await import(
          '@/components/features/profile/services/accountService'
        );
        return accountServiceModule.AccountService.getProfile();
      },
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient, session?.accessToken]);

  return {
    prefetchQuiz,
    prefetchQuestions,
    prefetchProfile,
  };
}
