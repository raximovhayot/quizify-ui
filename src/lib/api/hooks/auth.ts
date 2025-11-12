/**
 * React Query hooks for authentication operations
 */
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authApi, type SignInRequest, type SignUpPrepareRequest, type SignUpVerifyRequest } from '@/lib/api/endpoints/auth';

/**
 * Sign in mutation
 */
export const useSignIn = () => {
  return useMutation({
    mutationFn: async (data: SignInRequest) => {
      const response = await authApi.signIn(data);
      return response.data;
    },
    onSuccess: (data) => {
      // Store tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      toast.success('Signed in successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to sign in');
    },
  });
};

/**
 * Sign up prepare (send OTP) mutation
 */
export const useSignUpPrepare = () => {
  return useMutation({
    mutationFn: async (data: SignUpPrepareRequest) => {
      const response = await authApi.signUpPrepare(data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('OTP sent to your phone');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    },
  });
};

/**
 * Sign up verify (verify OTP) mutation
 */
export const useSignUpVerify = () => {
  return useMutation({
    mutationFn: async (data: SignUpVerifyRequest) => {
      const response = await authApi.signUpVerify(data);
      return response.data;
    },
    onSuccess: (data) => {
      // Store tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      toast.success('Account created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to verify OTP');
    },
  });
};

/**
 * Sign out mutation
 */
export const useSignOut = () => {
  return useMutation({
    mutationFn: async () => {
      await authApi.signOut();
    },
    onSuccess: () => {
      // Clear tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      toast.success('Signed out successfully');
      // Redirect to sign-in page
      window.location.href = '/sign-in';
    },
    onError: (error: any) => {
      // Even if API call fails, clear local tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      toast.error(error.response?.data?.message || 'Signed out');
      window.location.href = '/sign-in';
    },
  });
};
