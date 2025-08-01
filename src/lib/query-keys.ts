/**
 * Centralized React Query key management
 * Provides consistent query key patterns and type safety for React Query
 */

import { UserId, QuizId, CourseId } from '@/types/utils';
import { SearchParams } from '@/types/common';

/**
 * Query key factory for consistent key generation
 */
export const queryKeys = {
  // Authentication queries
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
  },

  // Profile queries
  profile: {
    all: ['profile'] as const,
    detail: (userId: UserId) => [...queryKeys.profile.all, 'detail', userId] as const,
    current: () => [...queryKeys.profile.all, 'current'] as const,
    avatar: (userId: UserId) => [...queryKeys.profile.all, 'avatar', userId] as const,
  },

  // Quiz queries
  quiz: {
    all: ['quiz'] as const,
    lists: () => [...queryKeys.quiz.all, 'list'] as const,
    list: (params: SearchParams) => [...queryKeys.quiz.lists(), params] as const,
    details: () => [...queryKeys.quiz.all, 'detail'] as const,
    detail: (quizId: QuizId) => [...queryKeys.quiz.details(), quizId] as const,
    results: () => [...queryKeys.quiz.all, 'results'] as const,
    result: (quizId: QuizId, userId: UserId) => 
      [...queryKeys.quiz.results(), quizId, userId] as const,
    attempts: (quizId: QuizId, userId: UserId) => 
      [...queryKeys.quiz.all, 'attempts', quizId, userId] as const,
  },

  // Course queries
  course: {
    all: ['course'] as const,
    lists: () => [...queryKeys.course.all, 'list'] as const,
    list: (params: SearchParams) => [...queryKeys.course.lists(), params] as const,
    details: () => [...queryKeys.course.all, 'detail'] as const,
    detail: (courseId: CourseId) => [...queryKeys.course.details(), courseId] as const,
    enrolled: (userId: UserId) => [...queryKeys.course.all, 'enrolled', userId] as const,
    progress: (courseId: CourseId, userId: UserId) => 
      [...queryKeys.course.all, 'progress', courseId, userId] as const,
  },

  // Statistics queries
  stats: {
    all: ['stats'] as const,
    user: (userId: UserId) => [...queryKeys.stats.all, 'user', userId] as const,
    quiz: (quizId: QuizId) => [...queryKeys.stats.all, 'quiz', quizId] as const,
    course: (courseId: CourseId) => [...queryKeys.stats.all, 'course', courseId] as const,
    dashboard: () => [...queryKeys.stats.all, 'dashboard'] as const,
  },

  // Notification queries
  notifications: {
    all: ['notifications'] as const,
    list: (userId: UserId) => [...queryKeys.notifications.all, 'list', userId] as const,
    unread: (userId: UserId) => [...queryKeys.notifications.all, 'unread', userId] as const,
    count: (userId: UserId) => [...queryKeys.notifications.all, 'count', userId] as const,
  },
} as const;

/**
 * Query key type extraction utility
 */
export type QueryKey = typeof queryKeys;

/**
 * Extract query key type from factory function
 */
export type ExtractQueryKey<T> = T extends (...args: unknown[]) => infer R ? R : never;

/**
 * Query invalidation utilities
 */
export const queryInvalidation = {
  /**
   * Invalidate all auth-related queries
   */
  auth: {
    all: () => queryKeys.auth.all,
    user: () => queryKeys.auth.user(),
    session: () => queryKeys.auth.session(),
  },

  /**
   * Invalidate profile-related queries
   */
  profile: {
    all: () => queryKeys.profile.all,
    current: () => queryKeys.profile.current(),
    detail: (userId: UserId) => queryKeys.profile.detail(userId),
  },

  /**
   * Invalidate quiz-related queries
   */
  quiz: {
    all: () => queryKeys.quiz.all,
    lists: () => queryKeys.quiz.lists(),
    detail: (quizId: QuizId) => queryKeys.quiz.detail(quizId),
    results: (quizId?: QuizId) => 
      quizId ? queryKeys.quiz.result(quizId, '' as UserId) : queryKeys.quiz.results(),
  },

  /**
   * Invalidate course-related queries
   */
  course: {
    all: () => queryKeys.course.all,
    lists: () => queryKeys.course.lists(),
    detail: (courseId: CourseId) => queryKeys.course.detail(courseId),
    enrolled: (userId: UserId) => queryKeys.course.enrolled(userId),
  },

  /**
   * Invalidate statistics queries
   */
  stats: {
    all: () => queryKeys.stats.all,
    user: (userId: UserId) => queryKeys.stats.user(userId),
    dashboard: () => queryKeys.stats.dashboard(),
  },
};

/**
 * Query stale time configurations (in milliseconds)
 */
export const queryStaleTime = {
  // Very short - real-time data
  realtime: 0,
  
  // Short - frequently changing data
  short: 30 * 1000, // 30 seconds
  
  // Medium - moderately changing data
  medium: 5 * 60 * 1000, // 5 minutes
  
  // Long - rarely changing data
  long: 30 * 60 * 1000, // 30 minutes
  
  // Very long - static data
  static: 24 * 60 * 60 * 1000, // 24 hours
} as const;

/**
 * Query cache time configurations (in milliseconds)
 */
export const queryCacheTime = {
  // Very short - temporary data
  temporary: 5 * 60 * 1000, // 5 minutes
  
  // Short - session data
  session: 30 * 60 * 1000, // 30 minutes
  
  // Medium - user session data
  medium: 60 * 60 * 1000, // 1 hour
  
  // Long - persistent data
  long: 24 * 60 * 60 * 1000, // 24 hours
  
  // Very long - static data
  static: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

/**
 * Default query configurations for different data types
 */
export const queryDefaults = {
  auth: {
    staleTime: queryStaleTime.short,
    cacheTime: queryCacheTime.session,
    retry: 1,
    refetchOnWindowFocus: true,
  },
  
  profile: {
    staleTime: queryStaleTime.medium,
    cacheTime: queryCacheTime.medium,
    retry: 2,
    refetchOnWindowFocus: false,
  },
  
  quiz: {
    staleTime: queryStaleTime.medium,
    cacheTime: queryCacheTime.long,
    retry: 2,
    refetchOnWindowFocus: false,
  },
  
  course: {
    staleTime: queryStaleTime.long,
    cacheTime: queryCacheTime.long,
    retry: 2,
    refetchOnWindowFocus: false,
  },
  
  stats: {
    staleTime: queryStaleTime.short,
    cacheTime: queryCacheTime.medium,
    retry: 1,
    refetchOnWindowFocus: true,
  },
  
  notifications: {
    staleTime: queryStaleTime.realtime,
    cacheTime: queryCacheTime.temporary,
    retry: 1,
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000, // 30 seconds
  },
} as const;

/**
 * Utility function to create consistent query options
 */
export function createQueryOptions<T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
  config?: {
    staleTime?: number;
    cacheTime?: number;
    retry?: number;
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
    refetchInterval?: number;
  }
) {
  return {
    queryKey,
    queryFn,
    staleTime: config?.staleTime ?? queryStaleTime.medium,
    cacheTime: config?.cacheTime ?? queryCacheTime.medium,
    retry: config?.retry ?? 2,
    enabled: config?.enabled ?? true,
    refetchOnWindowFocus: config?.refetchOnWindowFocus ?? false,
    refetchInterval: config?.refetchInterval,
  };
}