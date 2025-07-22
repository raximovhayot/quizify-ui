import { apiClient } from './api';
import { 
  AccountDTO, 
  JWTToken,
  SignInRequest,
  SignUpPrepareRequest,
  SignInPrepareResponse,
  SignUpVerifyRequest,
  AccountCompleteRequest,
  ForgotPasswordPrepareRequest,
  ForgotPasswordVerifyRequest,
  ForgotPasswordVerifyResponse,
  ForgotPasswordUpdateRequest,
  RefreshTokenRequest
} from '@/types/auth';
import { ApiResponse, extractApiData } from '@/types/api';

/**
 * Authentication service for handling all auth-related API calls
 * Updated to support OTP-based authentication flows
 */
export class AuthService {
  /**
   * Authenticate user with phone and password
   */
  static async login(phone: string, password: string): Promise<JWTToken> {
    const request: SignInRequest = { phone, password };
    const response: ApiResponse<JWTToken> = await apiClient.post('/auth/sign-in', request);
    return extractApiData(response);
  }

  /**
   * Prepare sign-up by sending OTP to phone
   */
  static async signUpPrepare(phone: string): Promise<SignInPrepareResponse> {
    const request: SignUpPrepareRequest = { phone };
    const response: ApiResponse<SignInPrepareResponse> = await apiClient.post('/auth/sign-up/prepare', request);
    return extractApiData(response);
  }

  /**
   * Verify sign-up OTP (step 2 of sign-up process)
   */
  static async signUpVerify(data: SignUpVerifyRequest): Promise<void> {
    const response: ApiResponse<void> = await apiClient.post('/auth/sign-up/verify', data);
    extractApiData(response);
  }

  /**
   * Complete account profile (step 3 of sign-up process)
   */
  static async completeAccount(data: AccountCompleteRequest): Promise<AccountDTO> {
    const response: ApiResponse<AccountDTO> = await apiClient.post('/account/complete', data);
    return extractApiData(response);
  }

  /**
   * Prepare forgot password by sending OTP to phone
   */
  static async forgotPasswordPrepare(phone: string): Promise<SignInPrepareResponse> {
    const request: ForgotPasswordPrepareRequest = { phone };
    const response: ApiResponse<SignInPrepareResponse> = await apiClient.post('/auth/forgot-password/prepare', request);
    return extractApiData(response);
  }

  /**
   * Verify forgot password OTP
   */
  static async forgotPasswordVerify(phone: string, otp: string): Promise<ForgotPasswordVerifyResponse> {
    const request: ForgotPasswordVerifyRequest = { phone, otp };
    const response: ApiResponse<ForgotPasswordVerifyResponse> = await apiClient.post('/auth/forgot-password/verify', request);
    return extractApiData(response);
  }

  /**
   * Update password with verification token
   */
  static async forgotPasswordUpdate(token: string, newPassword: string): Promise<void> {
    const request: ForgotPasswordUpdateRequest = { token, newPassword };
    const response: ApiResponse<void> = await apiClient.post('/auth/forgot-password/update', request);
    extractApiData(response);
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshToken: string): Promise<JWTToken> {
    const request: RefreshTokenRequest = { refreshToken };
    const response: ApiResponse<JWTToken> = await apiClient.post('/auth/refresh-token', request);
    return extractApiData(response);
  }

  /**
   * Logout user (client-side only - JWT tokens are stateless)
   */
  static async logout(): Promise<void> {
    // JWT tokens are stateless, so logout is handled entirely on the client side
    // No backend call needed - tokens will expire naturally
    return Promise.resolve();
  }

  /**
   * Verify current user session
   */
  static async verifyToken(accessToken: string): Promise<AccountDTO> {
    const response: ApiResponse<AccountDTO> = await apiClient.get('/account/me', accessToken);
    return extractApiData(response);
  }

}