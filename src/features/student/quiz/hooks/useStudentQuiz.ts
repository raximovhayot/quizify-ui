import { useQuery } from '@tanstack/react-query';

import { QuestionDataDto } from '@/features/instructor/quiz/types/question';
import { QuizDataDTO } from '@/features/instructor/quiz/types/quiz';
import { studentQuizKeys } from '@/features/student/quiz/keys';

import { StudentQuizService } from '../services/studentQuizService';

export function useStudentQuiz(quizId: number) {
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
