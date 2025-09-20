import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { useSession } from 'next-auth/react';

import { quizDataDTOSchema } from '@/components/features/instructor/quiz/schemas/quizSchema';
import { QuizDataDTO } from '@/components/features/instructor/quiz/types/quiz';
import { StudentQuizService } from '@/components/features/student/quiz/services/studentQuizService';

export const studentHomeKeys = {
  all: ['student', 'quizzes'] as const,
  upcoming: () => [...studentHomeKeys.all, 'upcoming'] as const,
  inProgress: () => [...studentHomeKeys.all, 'in-progress'] as const,
};

export function useStudentUpcomingQuizzes() {
  const { data: session } = useSession();

  return useQuery<QuizDataDTO[]>({
    queryKey: studentHomeKeys.upcoming(),
    queryFn: async ({ signal }) => {
      if (!session?.accessToken) throw new Error('No access token available');
      const data = await StudentQuizService.getUpcomingQuizzes(signal);
      return z.array(quizDataDTOSchema).parse(data);
    },
    enabled: !!session?.accessToken,
    staleTime: 60_000,
  });
}

export function useStudentInProgressQuizzes() {
  const { data: session } = useSession();

  return useQuery<QuizDataDTO[]>({
    queryKey: studentHomeKeys.inProgress(),
    queryFn: async ({ signal }) => {
      if (!session?.accessToken) throw new Error('No access token available');
      const data = await StudentQuizService.getInProgressQuizzes(signal);
      return z.array(quizDataDTOSchema).parse(data);
    },
    enabled: !!session?.accessToken,
    staleTime: 30_000,
  });
}
