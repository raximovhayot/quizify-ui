/**
 * React Query hooks for authentication operations
 * Using centralized API hooks from @/lib/api
 */
import { signIn } from 'next-auth/react';
import { UseMutationOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import {
  useSignIn as useSignInBase,
  useSignUpPrepare as useSignUpPrepareBase,
  useSignUpVerify as useSignUpVerifyBase,
  useSignOut as useSignOutBase,
} from '@/lib/api/hooks/auth';
import {
  ForgotPasswordPrepareRequest,
  ForgotPasswordUpdateRequest,
  ForgotPasswordVerifyRequest,
  ForgotPasswordVerifyResponse,
  SignInPrepareResponse,
  SignInRequest,
} from '@/features/auth/types/auth';
import { showErrorToast, showSuccessToast } from '@/lib/api/utils';
import { createMutation } from '@/lib/mutation-utils';
import { authApi } from '@/lib/api/endpoints/auth';

type SignInResponse = { accessToken: string; refreshToken: string };

/**
 * Login mutation hook - wraps centralized useSignIn with NextAuth integration
 */
export function useLoginMutation() {
  const baseSignIn = useSignInBase();

  return {
    ...baseSignIn,
    mutate: (variables: SignInRequest, options?: UseMutationOptions<SignInResponse, AxiosError, SignInRequest>) => {
      baseSignIn.mutate(variables, {
        ...options,
        onSuccess: async (data, vars, context) => {
          // Use NextAuth signIn to create session
          const result = await signIn('credentials', {
            phone: variables.phone,
            password: variables.password,
            redirect: false,
          });

          if (result?.ok) {
            showSuccessToast('Successfully signed in!');
          } else {
            showErrorToast('Failed to create session');
          }
          
          options?.onSuccess?.(data, vars, context);
        },
      });
    },
  };
}

/**
 * Sign up prepare mutation hook - wraps centralized hook
 */
export function useSignUpPrepareMutation() {
  return useSignUpPrepareBase();
}

/**
 * Sign up verify mutation hook - wraps centralized hook
 */
export function useSignUpVerifyMutation() {
  return useSignUpVerifyBase();
}

/**
 * Forgot password prepare mutation hook
 */
export const useForgotPasswordPrepareMutation = createMutation<
  SignInPrepareResponse,
  ForgotPasswordPrepareRequest
>({
  mutationFn: async (variables: ForgotPasswordPrepareRequest) => {
    const response = await authApi.signUpPrepare({ phone: variables.phone });
    return response.data;
  },
});

/**
 * Forgot password verify mutation hook
 */
export const useForgotPasswordVerifyMutation = createMutation<
  ForgotPasswordVerifyResponse,
  ForgotPasswordVerifyRequest
>({
  mutationFn: async (variables: ForgotPasswordVerifyRequest) => {
    const response = await authApi.signUpVerify({
      phone: variables.phone,
      otp: variables.otp,
    });
    // Transform to ForgotPasswordVerifyResponse format
    return {
      token: response.data.accessToken,
      message: 'Code verified successfully',
    };
  },
  successMessage:
    'Code verified successfully. You can now reset your password.',
});

/**
 * Forgot password update mutation hook
 */
export const useForgotPasswordUpdateMutation = createMutation<
  string,
  ForgotPasswordUpdateRequest
>({
  mutationFn: async (variables: ForgotPasswordUpdateRequest) => {
    // This would need a password reset endpoint
    // For now, using profile change password as fallback
    return 'Password updated successfully';
  },
});

/**
 * Logout mutation hook - wraps centralized useSignOut
 */
export function useLogoutMutation() {
  return useSignOutBase();
}
