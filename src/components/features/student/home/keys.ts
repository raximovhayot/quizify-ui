export const studentHomeKeys = {
  all: ['student', 'quizzes'] as const,
  upcoming: () => [...studentHomeKeys.all, 'upcoming'] as const,
  inProgress: () => [...studentHomeKeys.all, 'in-progress'] as const,
} as const;
