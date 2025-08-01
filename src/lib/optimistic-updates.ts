/**
 * Optimistic updates utilities for React Query
 * Provides patterns for implementing optimistic updates with proper rollback
 */

import { QueryClient } from '@tanstack/react-query';
import { UserId, QuizId, CourseId } from '@/types/utils';
import { queryKeys } from './query-keys';
import { ApiResponse, BackendError } from '@/types/api';

/**
 * Optimistic update context for rollback
 */
export interface OptimisticContext<T = unknown> {
  previousData: T;
  queryKey: readonly unknown[];
  timestamp: number;
}

/**
 * Optimistic update configuration
 */
export interface OptimisticUpdateConfig<TData, TVariables> {
  queryKey: readonly unknown[];
  updater: (oldData: TData | undefined, variables: TVariables) => TData;
  rollback?: (context: OptimisticContext<TData>) => void;
}

/**
 * Create optimistic update handlers
 */
export function createOptimisticUpdate<TData, TVariables>(
  queryClient: QueryClient,
  config: OptimisticUpdateConfig<TData, TVariables>
) {
  return {
    /**
     * Apply optimistic update
     */
    onMutate: async (variables: TVariables): Promise<OptimisticContext<TData>> => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: config.queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<TData>(config.queryKey);

      // Optimistically update to the new value
      if (previousData !== undefined) {
        const newData = config.updater(previousData, variables);
        queryClient.setQueryData(config.queryKey, newData);
      }

      // Return context for rollback
      return {
        previousData: previousData as TData,
        queryKey: config.queryKey,
        timestamp: Date.now(),
      };
    },

    /**
     * Rollback on error
     */
    onError: (
      error: BackendError,
      variables: TVariables,
      context: OptimisticContext<TData> | undefined
    ) => {
      if (context) {
        // Rollback to previous data
        queryClient.setQueryData(context.queryKey, context.previousData);
        
        // Custom rollback logic
        if (config.rollback) {
          config.rollback(context);
        }
      }
    },

    /**
     * Refetch on success or error
     */
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: config.queryKey });
    },
  };
}

/**
 * Profile optimistic updates
 */
export const profileOptimisticUpdates = {
  /**
   * Update profile optimistically
   */
  updateProfile: (queryClient: QueryClient, userId: UserId) =>
    createOptimisticUpdate(queryClient, {
      queryKey: queryKeys.profile.detail(userId),
      updater: (oldData, variables) => ({
        ...oldData,
        ...variables,
        updatedAt: new Date().toISOString(),
      }),
    }),

  /**
   * Update current profile optimistically
   */
  updateCurrentProfile: (queryClient: QueryClient) =>
    createOptimisticUpdate(queryClient, {
      queryKey: queryKeys.profile.current(),
      updater: (oldData, variables) => ({
        ...oldData,
        ...variables,
        updatedAt: new Date().toISOString(),
      }),
    }),
};

/**
 * Quiz optimistic updates
 */
export const quizOptimisticUpdates = {
  /**
   * Update quiz optimistically
   */
  updateQuiz: (queryClient: QueryClient, quizId: QuizId) =>
    createOptimisticUpdate(queryClient, {
      queryKey: queryKeys.quiz.detail(quizId),
      updater: (oldData, variables) => ({
        ...oldData,
        ...variables,
        updatedAt: new Date().toISOString(),
      }),
    }),

  /**
   * Add quiz to list optimistically
   */
  addQuizToList: (queryClient: QueryClient) =>
    createOptimisticUpdate(queryClient, {
      queryKey: queryKeys.quiz.lists(),
      updater: (oldData, newQuiz) => {
        if (!oldData || !Array.isArray(oldData)) return oldData;
        return [newQuiz, ...oldData];
      },
    }),

  /**
   * Remove quiz from list optimistically
   */
  removeQuizFromList: (queryClient: QueryClient, quizId: QuizId) =>
    createOptimisticUpdate(queryClient, {
      queryKey: queryKeys.quiz.lists(),
      updater: (oldData) => {
        if (!oldData || !Array.isArray(oldData)) return oldData;
        return oldData.filter((quiz: { id: unknown }) => quiz.id !== quizId);
      },
    }),
};

/**
 * Course optimistic updates
 */
export const courseOptimisticUpdates = {
  /**
   * Update course optimistically
   */
  updateCourse: (queryClient: QueryClient, courseId: CourseId) =>
    createOptimisticUpdate(queryClient, {
      queryKey: queryKeys.course.detail(courseId),
      updater: (oldData, variables) => ({
        ...oldData,
        ...variables,
        updatedAt: new Date().toISOString(),
      }),
    }),

  /**
   * Update course progress optimistically
   */
  updateProgress: (queryClient: QueryClient, courseId: CourseId, userId: UserId) =>
    createOptimisticUpdate(queryClient, {
      queryKey: queryKeys.course.progress(courseId, userId),
      updater: (oldData, variables) => ({
        ...oldData,
        ...variables,
        lastUpdated: new Date().toISOString(),
      }),
    }),

  /**
   * Enroll in course optimistically
   */
  enrollInCourse: (queryClient: QueryClient, userId: UserId) =>
    createOptimisticUpdate(queryClient, {
      queryKey: queryKeys.course.enrolled(userId),
      updater: (oldData, newCourse) => {
        if (!oldData || !Array.isArray(oldData)) return oldData;
        return [...oldData, { ...newCourse, enrolledAt: new Date().toISOString() }];
      },
    }),
};

/**
 * Notification optimistic updates
 */
export const notificationOptimisticUpdates = {
  /**
   * Mark notification as read optimistically
   */
  markAsRead: (queryClient: QueryClient, userId: UserId) =>
    createOptimisticUpdate(queryClient, {
      queryKey: queryKeys.notifications.list(userId),
      updater: (oldData, notificationId) => {
        if (!oldData || !Array.isArray(oldData)) return oldData;
        return oldData.map((notification: { id: unknown; read?: boolean }) =>
          notification.id === notificationId
            ? { ...notification, read: true, readAt: new Date().toISOString() }
            : notification
        );
      },
    }),

  /**
   * Update unread count optimistically
   */
  updateUnreadCount: (queryClient: QueryClient, userId: UserId) =>
    createOptimisticUpdate(queryClient, {
      queryKey: queryKeys.notifications.count(userId),
      updater: (oldCount, delta) => {
        const currentCount = typeof oldCount === 'number' ? oldCount : 0;
        return Math.max(0, currentCount + delta);
      },
    }),
};

/**
 * Batch optimistic updates utility
 */
export function createBatchOptimisticUpdate<TData, TVariables>(
  queryClient: QueryClient,
  configs: OptimisticUpdateConfig<TData, TVariables>[]
) {
  return {
    onMutate: async (variables: TVariables) => {
      const contexts = await Promise.all(
        configs.map(async (config) => {
          await queryClient.cancelQueries({ queryKey: config.queryKey });
          const previousData = queryClient.getQueryData<TData>(config.queryKey);
          
          if (previousData !== undefined) {
            const newData = config.updater(previousData, variables);
            queryClient.setQueryData(config.queryKey, newData);
          }
          
          return {
            previousData: previousData as TData,
            queryKey: config.queryKey,
            timestamp: Date.now(),
          };
        })
      );

      return contexts;
    },

    onError: (
      error: BackendError,
      variables: TVariables,
      contexts: OptimisticContext<TData>[] | undefined
    ) => {
      if (contexts) {
        contexts.forEach((context, index) => {
          queryClient.setQueryData(context.queryKey, context.previousData);
          
          const config = configs[index];
          if (config?.rollback) {
            config.rollback(context);
          }
        });
      }
    },

    onSettled: () => {
      configs.forEach((config) => {
        queryClient.invalidateQueries({ queryKey: config.queryKey });
      });
    },
  };
}

/**
 * Optimistic update with timeout rollback
 */
export function createOptimisticUpdateWithTimeout<TData, TVariables>(
  queryClient: QueryClient,
  config: OptimisticUpdateConfig<TData, TVariables> & { timeout?: number }
) {
  const baseUpdate = createOptimisticUpdate(queryClient, config);
  const timeout = config.timeout || 5000; // 5 seconds default

  return {
    ...baseUpdate,
    onMutate: async (variables: TVariables) => {
      const context = await baseUpdate.onMutate(variables);
      
      // Set timeout for automatic rollback
      const timeoutId = setTimeout(() => {
        queryClient.setQueryData(context.queryKey, context.previousData);
        console.warn('Optimistic update timed out, rolling back');
      }, timeout);

      return { ...context, timeoutId };
    },

    onSettled: () => {
      // Clear timeout on settlement
      const context = queryClient.getMutationCache().getAll()[0]?.state.context as OptimisticContext & { timeoutId?: NodeJS.Timeout };
      if (context?.timeoutId) {
        clearTimeout(context.timeoutId);
      }
      
      baseUpdate.onSettled();
    },
  };
}