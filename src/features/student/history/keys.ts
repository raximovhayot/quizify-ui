export const attemptHistoryKeys = {
  all: ['student', 'attempts'] as const,
  history: (status?: string, page?: number, size?: number) =>
    [
      ...attemptHistoryKeys.all,
      'history',
      { status: status || '', page: page ?? 0, size: size ?? 10 },
    ] as const,
} as const;
