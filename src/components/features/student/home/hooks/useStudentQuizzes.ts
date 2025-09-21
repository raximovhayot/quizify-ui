import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { useSession } from 'next-auth/react';

import { quizDataDTOSchema } from '@/components/features/instructor/quiz/schemas/quizSchema';
import { QuizDataDTO } from '@/components/features/instructor/quiz/types/quiz';
import { studentHomeKeys } from '@/components/features/student/home/keys';
import { StudentQuizService } from '@/components/features/student/quiz/services/studentQuizService';

export function useStudentUpcomingQuizzes() {
  const { status } = useSession();

  return useQuery<QuizDataDTO[]>({
    queryKey: studentHomeKeys.upcoming(),
    queryFn: async ({ signal }) => {
      const data = await StudentQuizService.getUpcomingQuizzes(signal);
      return z.array(quizDataDTOSchema).parse(data);
    },
    enabled: status === 'authenticated',
    staleTime: 60_000,
  });
}

export function useStudentInProgressQuizzes() {
  const { status } = useSession();

  return useQuery<QuizDataDTO[]>({
    queryKey: studentHomeKeys.inProgress(),
    queryFn: async ({ signal }) => {
      const data = await StudentQuizService.getInProgressQuizzes(signal);
      return z.array(quizDataDTOSchema).parse(data);
    },
    enabled: status === 'authenticated',
    staleTime: 30_000,
  });
}
