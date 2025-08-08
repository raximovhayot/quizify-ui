/**
 * React Query hooks for authentication operations
 * Refactored to use standardized mutation patterns
 */
import { signIn } from 'next-auth/react';

import {
  ForgotPasswordPrepareRequest,
  ForgotPasswordUpdateRequest,
  ForgotPasswordVerifyRequest,
  ForgotPasswordVerifyResponse,
  JWTToken,
  SignInPrepareResponse,
  SignInRequest,
  SignUpPrepareRequest,
  SignUpVerifyRequest,
} from '@/components/features/auth/types/auth';
import { apiClient } from '@/lib/api';
import { showErrorToast, showSuccessToast } from '@/lib/api-utils';
import { createAuthMutation, createMutation } from '@/lib/mutation-utils';

/**
 * Login mutation hook with automatic error handling
 */
export const useLoginMutation = createAuthMutation<JWTToken, SignInRequest>({
  mutationFn: async (variables: SignInRequest) => {
    return await apiClient.post<JWTToken>('/auth/sign-in', variables);
  },
  authAction: 'login',
  onSuccess: async (data, variables) => {
    // Use NextAuth signIn to create session
    const result = await signIn('credentials', {
      phone: variables.phone,
      password: variables.password,
      redirect: false,
    });

    if (result?.ok) {
      showSuccessToast('Successfully signed in!');
      // Redirect will be handled by middleware or auth guards
    } else {
      showErrorToast('Failed to create session');
    }
  },
});

/**
 * Sign up prepare mutation hook
 */
export const useSignUpPrepareMutation = createMutation<
  SignInPrepareResponse,
  SignUpPrepareRequest
>({
  mutationFn: async (variables: SignUpPrepareRequest) => {
    return await apiClient.post<SignInPrepareResponse>(
      '/auth/sign-up/prepare',
      variables
    );
  },
  successMessage: (data) =>
    `OTP sent to ${data.phoneNumber}. Please check your messages.`,
});

/**
 * Sign up verify mutation hook
 */
export const useSignUpVerifyMutation = createMutation<
  JWTToken,
  SignUpVerifyRequest
>({
  mutationFn: async (variables: SignUpVerifyRequest) => {
    return await apiClient.post<JWTToken>('/auth/sign-up/verify', variables);
  },
  successMessage: 'Phone verified successfully!',
});

/**
 * Forgot password prepare mutation hook
 */
export const useForgotPasswordPrepareMutation = createMutation<
  SignInPrepareResponse,
  ForgotPasswordPrepareRequest
>({
  mutationFn: async (variables: ForgotPasswordPrepareRequest) => {
    return await apiClient.post<SignInPrepareResponse>(
      '/auth/forgot-password/prepare',
      variables
    );
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
    return await apiClient.post<ForgotPasswordVerifyResponse>(
      '/auth/forgot-password/verify',
      variables
    );
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
    return await apiClient.post<string>(
      '/auth/forgot-password/update',
      variables
    );
  },
});

/**
 * Logout mutation hook
 */
export const useLogoutMutation = createAuthMutation<void, void>({
  mutationFn: async () => {
    // NextAuth signOut will be handled by useNextAuth hook
    // Return a successful API response structure
    return { data: undefined, errors: [] };
  },
  authAction: 'logout',
  successMessage: 'Successfully signed out',
  redirectTo: '/sign-in',
});
