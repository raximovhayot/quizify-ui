/**
 * React Query hooks for authentication operations
 * Following StartUI patterns with error handling and toast notifications
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { apiClient } from '@/lib/api';
import {
  JWTToken,
  SignInRequest,
  SignUpPrepareRequest,
  SignUpVerifyRequest,
  ForgotPasswordPrepareRequest,
  ForgotPasswordVerifyRequest,
  ForgotPasswordUpdateRequest,
  SignInPrepareResponse,
  ForgotPasswordVerifyResponse,
} from '@/components/features/auth/types/auth';
import { BackendError, ApiResponse, hasApiErrors } from '@/types/api';

/**
 * Helper function to handle API responses and show error toasts
 */
const handleApiResponse = <T>(response: ApiResponse<T>): T => {
  if (hasApiErrors(response)) {
    // Show error toast for the first error
    const firstError = response.errors[0];
    toast.error(firstError?.message || 'An error occurred', {
      duration: 5000,
    });
    throw new BackendError(response);
  }
  return response.data;
};

/**
 * Login mutation hook with automatic error handling
 */
export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async (variables: SignInRequest): Promise<JWTToken> => {
      const response = await apiClient.post<JWTToken>('/auth/sign-in', variables);
      return handleApiResponse(response);
    },
    onSuccess: async (data, variables) => {
      // Use NextAuth signIn to create session
      const result = await signIn('credentials', {
        phone: variables.phone,
        password: variables.password,
        redirect: false,
      });

      if (result?.ok) {
        toast.success('Successfully signed in!');
        // Redirect will be handled by middleware or auth guards
      } else {
        toast.error('Failed to create session');
      }
    },
    onError: (error: BackendError) => {
      // Error toast is already shown by handleApiResponse
      console.error('Login failed:', error);
    },
  });
};

/**
 * Sign up prepare mutation hook
 */
export const useSignUpPrepareMutation = () => {
  return useMutation({
    mutationFn: async (variables: SignUpPrepareRequest): Promise<SignInPrepareResponse> => {
      const response = await apiClient.post<SignInPrepareResponse>('/auth/sign-up/prepare', variables);
      return handleApiResponse(response);
    },
    onSuccess: (data) => {
      toast.success(`OTP sent to ${data.phoneNumber}. Please check your messages.`);
    },
    onError: (error: BackendError) => {
      console.error('Sign up prepare failed:', error);
    },
  });
};

/**
 * Sign up verify mutation hook
 */
export const useSignUpVerifyMutation = () => {
  const router = useRouter();
  
  return useMutation({
    mutationFn: async (variables: SignUpVerifyRequest): Promise<JWTToken> => {
      const response = await apiClient.post<JWTToken>('/auth/sign-up/verify', variables);
      return handleApiResponse(response);
    },
    onSuccess: async (data, variables) => {
      // Use NextAuth signIn to create session
      const result = await signIn('credentials', {
        phone: variables.phone,
        password: '', // No password for new users
        redirect: false,
      });

      if (result?.ok) {
        toast.success('Account created successfully!');
        // User will be redirected to profile completion by middleware
      } else {
        toast.error('Failed to create session');
      }
    },
    onError: (error: BackendError) => {
      console.error('Sign up verify failed:', error);
    },
  });
};

/**
 * Forgot password prepare mutation hook
 */
export const useForgotPasswordPrepareMutation = () => {
  return useMutation({
    mutationFn: async (variables: ForgotPasswordPrepareRequest): Promise<SignInPrepareResponse> => {
      const response = await apiClient.post<SignInPrepareResponse>('/auth/forgot-password/prepare', variables);
      return handleApiResponse(response);
    },
    onSuccess: (data) => {
      toast.success(`Reset code sent to ${data.phoneNumber}. Please check your messages.`);
    },
    onError: (error: BackendError) => {
      console.error('Forgot password prepare failed:', error);
    },
  });
};

/**
 * Forgot password verify mutation hook
 */
export const useForgotPasswordVerifyMutation = () => {
  return useMutation({
    mutationFn: async (variables: ForgotPasswordVerifyRequest): Promise<ForgotPasswordVerifyResponse> => {
      const response = await apiClient.post<ForgotPasswordVerifyResponse>('/auth/forgot-password/verify', variables);
      return handleApiResponse(response);
    },
    onSuccess: (data) => {
      toast.success('Code verified successfully. You can now reset your password.');
    },
    onError: (error: BackendError) => {
      console.error('Forgot password verify failed:', error);
    },
  });
};

/**
 * Forgot password update mutation hook
 */
export const useForgotPasswordUpdateMutation = () => {
  const router = useRouter();
  
  return useMutation({
    mutationFn: async (variables: ForgotPasswordUpdateRequest): Promise<string> => {
      const response = await apiClient.post<string>('/auth/forgot-password/update', variables);
      return handleApiResponse(response);
    },
    onSuccess: () => {
      toast.success('Password updated successfully! Please sign in with your new password.');
      router.push('/sign-in');
    },
    onError: (error: BackendError) => {
      console.error('Forgot password update failed:', error);
    },
  });
};

/**
 * Logout mutation hook
 */
export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  
  return useMutation({
    mutationFn: async (): Promise<void> => {
      // Clear React Query cache
      queryClient.clear();
      
      // NextAuth signOut will be handled by useNextAuth hook
      return Promise.resolve();
    },
    onSuccess: () => {
      toast.success('Successfully signed out');
      router.push('/sign-in');
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      toast.error('Failed to sign out');
    },
  });
};