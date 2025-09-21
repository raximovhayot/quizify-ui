import {
  UseMutationOptions,
  UseMutationResult,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';

import { useRouter } from 'next/navigation';

import { handleApiResponse, showSuccessToast } from '@/lib/api-utils';
import { BackendError, IApiResponse } from '@/types/api';

/**
 * Base mutation configuration options
 */
interface BaseMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<IApiResponse<TData>>;
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  onError?: (
    error: BackendError,
    variables: TVariables
  ) => void | Promise<void>;
  successMessage?: string | ((data: TData, variables: TVariables) => string);
  invalidateQueries?: QueryKey[];
  redirectTo?: string | ((data: TData, variables: TVariables) => string);
  showSuccessToast?: boolean;
}

/**
 * Create a standardized mutation hook with consistent error handling and success patterns
 */
export function createMutation<TData = unknown, TVariables = void>(
  options: BaseMutationOptions<TData, TVariables>
): () => UseMutationResult<TData, BackendError, TVariables> {
  return function useMutationHook(): UseMutationResult<
    TData,
    BackendError,
    TVariables
  > {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation<TData, BackendError, TVariables>({
      mutationFn: async (variables: TVariables) => {
        const response = await options.mutationFn(variables);
        return handleApiResponse(response);
      },
      onSuccess: async (data: TData, variables: TVariables) => {
        // Show success toast if enabled and message provided
        if (options.showSuccessToast !== false && options.successMessage) {
          const message =
            typeof options.successMessage === 'function'
              ? options.successMessage(data, variables)
              : options.successMessage;
          showSuccessToast(message);
        }

        // Invalidate queries if specified
        if (options.invalidateQueries) {
          for (const queryKey of options.invalidateQueries) {
            await queryClient.invalidateQueries({ queryKey });
          }
        }

        // Handle redirect if specified
        if (options.redirectTo) {
          const redirectPath =
            typeof options.redirectTo === 'function'
              ? options.redirectTo(data, variables)
              : options.redirectTo;
          router.push(redirectPath);
        }

        // Call custom onSuccess handler
        if (options.onSuccess) {
          await options.onSuccess(data, variables);
        }
      },
      onError: async (error: BackendError, variables: TVariables) => {
        // Custom error handler takes precedence
        if (options.onError) {
          await options.onError(error, variables);
        }
        // Note: Error toast is already shown by handleApiResponse
      },
    });
  };
}

/**
 * Create a mutation hook with authentication patterns (sign-in/logout)
 */
export function createAuthMutation<TData = unknown, TVariables = void>(
  options: BaseMutationOptions<TData, TVariables> & {
    authAction?: 'login' | 'logout';
  }
): () => UseMutationResult<TData, BackendError, TVariables> {
  return function useAuthMutationHook(): UseMutationResult<
    TData,
    BackendError,
    TVariables
  > {
    const queryClient = useQueryClient();

    return createMutation({
      ...options,
      invalidateQueries: options.invalidateQueries || ['auth', 'user'],
      onSuccess: async (data: TData, variables: TVariables) => {
        // Handle auth-specific logic
        if (options.authAction === 'logout') {
          // Clear all queries on logout
          queryClient.clear();
        }

        // Call the original onSuccess handler
        if (options.onSuccess) {
          await options.onSuccess(data, variables);
        }
      },
    })();
  };
}

/**
 * Create a simple mutation hook for basic CRUD operations
 */
export function createSimpleMutation<TData = unknown, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<IApiResponse<TData>>,
  successMessage?: string
): () => UseMutationResult<TData, BackendError, TVariables> {
  return createMutation({
    mutationFn,
    successMessage,
    showSuccessToast: !!successMessage,
  });
}

/**
 * Mutation options type for external use
 */
export type MutationOptions<TData, TVariables> = UseMutationOptions<
  TData,
  BackendError,
  TVariables
>;

/**
 * Mutation result type for external use
 */
export type MutationResult<TData, TVariables> = UseMutationResult<
  TData,
  BackendError,
  TVariables
>;
