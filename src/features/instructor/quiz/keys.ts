import {QuestionFilter, QuizFilter} from "@/features/instructor/quiz/types";

export const quizKeys = {
  all: ['quizzes'] as const,
  lists: () => [...quizKeys.all, 'list'] as const,
  list: (filter: QuizFilter) =>
    [...quizKeys.lists(), filter] as const,
  details: () => [...quizKeys.all, 'detail'] as const,
  detail: (id: number) => [...quizKeys.details(), id] as const,
} as const;

export const questionKeys = {
  all: ['questions'] as const,
  lists: () => [...questionKeys.all, 'list'] as const,
  list: (filter: QuestionFilter) => [...questionKeys.lists(), filter] as const,
  details: () => [...questionKeys.all, 'detail'] as const,
  detail: (quizId: number, id: number) => [...questionKeys.details(), quizId, id] as const,
} as const;
