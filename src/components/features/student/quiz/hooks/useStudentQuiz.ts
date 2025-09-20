import { useQuery } from '@tanstack/react-query';

import { useSession } from 'next-auth/react';

import { QuestionDataDto } from '@/components/features/instructor/quiz/types/question';
import { QuizDataDTO } from '@/components/features/instructor/quiz/types/quiz';

import { StudentQuizService } from '../services/studentQuizService';

export const studentQuizKeys = {
  all: ['student-quiz'] as const,
  detail: (id: number) => [...studentQuizKeys.all, 'detail', id] as const,
  questions: (id: number) => [...studentQuizKeys.all, 'questions', id] as const,
};

export function useStudentQuiz(quizId: number) {
  const { data: session } = useSession();

  const quizQuery = useQuery({
    queryKey: studentQuizKeys.detail(quizId),
    queryFn: async ({ signal }): Promise<QuizDataDTO> => {
      return await StudentQuizService.getQuiz(quizId, signal);
    },
    enabled: !!quizId,
    staleTime: 5 * 60 * 1000,
  });

  const questionsQuery = useQuery({
    queryKey: studentQuizKeys.questions(quizId),
    queryFn: async ({ signal }): Promise<QuestionDataDto[]> => {
      return await StudentQuizService.getQuizQuestions(quizId, signal);
    },
    enabled: !!quizId,
    staleTime: 5 * 60 * 1000,
  });

  return { quizQuery, questionsQuery };
}
