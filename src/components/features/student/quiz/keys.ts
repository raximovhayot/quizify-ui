export const studentQuizKeys = {
  all: ['student-quiz'] as const,
  detail: (id: number) => [...studentQuizKeys.all, 'detail', id] as const,
  questions: (id: number) => [...studentQuizKeys.all, 'questions', id] as const,
} as const;
