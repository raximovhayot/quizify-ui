import {
  UseMutationResult,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { showSuccessToast, handleApiError } from '@/lib/api/utils';

/**
 * Base mutation configuration options
 */
interface BaseMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  onError?: (error: AxiosError, variables: TVariables) => void | Promise<void>;
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
): () => UseMutationResult<TData, AxiosError, TVariables> {
  return function useMutationHook(): UseMutationResult<
    TData,
    AxiosError,
    TVariables
  > {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation<TData, AxiosError, TVariables>({
      mutationFn: options.mutationFn,
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
      onError: async (error: AxiosError, variables: TVariables) => {
        // Custom error handler takes precedence
        if (options.onError) {
          await options.onError(error, variables);
        } else {
          // Default error handling
          handleApiError(error);
        }
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
): () => UseMutationResult<TData, AxiosError, TVariables> {
  return createMutation<TData, TVariables>(options);
}
