export const quizKeys = {
  all: ['quizzes'] as const,
  lists: () => [...quizKeys.all, 'list'] as const,
  list: (filter: Record<string, unknown>) =>
    [...quizKeys.lists(), filter] as const,
  details: () => [...quizKeys.all, 'detail'] as const,
  detail: (id: number) => [...quizKeys.details(), id] as const,
} as const;

export const questionKeys = {
  all: ['questions'] as const,
  lists: () => [...questionKeys.all, 'list'] as const,
  list: (filter: Record<string, unknown>) =>
    [...questionKeys.lists(), filter] as const,
} as const;
