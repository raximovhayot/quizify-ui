import { apiClient } from '../client';
import type { 
  SignInRequest, 
  SignUpPrepareRequest,
  SignUpVerifyRequest,
  JWTTokenResponse,
  RefreshTokenRequest,
} from '../types';

// Re-export types for use in hooks
export type { SignInRequest, SignUpPrepareRequest, SignUpVerifyRequest };

export const authApi = {
  signIn: (data: SignInRequest) =>
    apiClient.post<JWTTokenResponse>('/auth/sign-in', data),
  
  signUpPrepare: (data: SignUpPrepareRequest) =>
    apiClient.post('/auth/sign-up/prepare', data),
  
  signUpVerify: (data: SignUpVerifyRequest) =>
    apiClient.post<JWTTokenResponse>('/auth/sign-up/verify', data),
  
  refreshToken: (data: RefreshTokenRequest) =>
    apiClient.post<JWTTokenResponse>('/auth/refresh-token', data),
  
  signOut: () =>
    apiClient.post('/auth/sign-out'),
};
