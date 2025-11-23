/**
 * Query key factory for React Query
 * 
 * This provides a centralized, type-safe way to manage query keys
 * and ensures consistency across the application.
 * 
 * Usage:
 * ```tsx
 * useQuery({
 *   queryKey: queryKeys.quizzes.detail(quizId),
 *   queryFn: () => quizzesApi.getById(quizId),
 * })
 * ```
 */

export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
  },
  
  // Quizzes
  quizzes: {
    all: ['quizzes'] as const,
    lists: () => [...queryKeys.quizzes.all, 'list'] as const,
    list: (params?: unknown) => [...queryKeys.quizzes.lists(), params] as const,
    details: () => [...queryKeys.quizzes.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.quizzes.details(), id] as const,
  },
  
  // Questions
  questions: {
    all: ['questions'] as const,
    lists: () => [...queryKeys.questions.all, 'list'] as const,
    list: (quizId: number) => [...queryKeys.questions.lists(), quizId] as const,
    details: () => [...queryKeys.questions.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.questions.details(), id] as const,
  },
  
  // Assignments
  assignments: {
    all: ['assignments'] as const,
    lists: () => [...queryKeys.assignments.all, 'list'] as const,
    list: (params?: unknown) => [...queryKeys.assignments.lists(), params] as const,
    details: () => [...queryKeys.assignments.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.assignments.details(), id] as const,
  },
  
  // Attempts
  attempts: {
    all: ['attempts'] as const,
    lists: () => [...queryKeys.attempts.all, 'list'] as const,
    list: (params?: unknown) => [...queryKeys.attempts.lists(), params] as const,
    details: () => [...queryKeys.attempts.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.attempts.details(), id] as const,
    content: (id: number) => [...queryKeys.attempts.detail(id), 'content'] as const,
  },
  
  // Profile
  profile: {
    all: ['profile'] as const,
    current: () => [...queryKeys.profile.all, 'current'] as const,
  },
} as const;
