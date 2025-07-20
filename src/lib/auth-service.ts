import { apiClient } from './api';
import { 
  User, 
  JWTToken,
  SignInRequest,
  SignUpPrepareRequest,
  SignInPrepareResponse,
  SignUpVerifyRequest,
  ForgotPasswordPrepareRequest,
  ForgotPasswordVerifyRequest,
  ForgotPasswordVerifyResponse,
  ForgotPasswordUpdateRequest,
  RefreshTokenRequest,
  RefreshTokenResponse
} from '@/types/auth';
import { ApiResponse, hasApiErrors, extractApiData } from '@/types/api';

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
    const response: ApiResponse<JWTToken> = await apiClient.post('/auth/login', request);
    return extractApiData(response);
  }

  /**
   * Prepare sign-up by sending OTP to phone
   */
  static async signUpPrepare(phone: string): Promise<SignInPrepareResponse> {
    const request: SignUpPrepareRequest = { phone };
    const response: ApiResponse<SignInPrepareResponse> = await apiClient.post('/auth/signup/prepare', request);
    return extractApiData(response);
  }

  /**
   * Verify sign-up with OTP and complete registration
   */
  static async signUpVerify(data: SignUpVerifyRequest): Promise<JWTToken> {
    const response: ApiResponse<JWTToken> = await apiClient.post('/auth/signup/verify', data);
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
  static async forgotPasswordUpdate(verificationToken: string, newPassword: string): Promise<void> {
    const request: ForgotPasswordUpdateRequest = { verificationToken, newPassword };
    const response: ApiResponse<void> = await apiClient.post('/auth/forgot-password/update', request);
    extractApiData(response);
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const request: RefreshTokenRequest = { refreshToken };
    const response: ApiResponse<RefreshTokenResponse> = await apiClient.post('/auth/refresh', request);
    return extractApiData(response);
  }

  /**
   * Logout user (invalidate tokens)
   */
  static async logout(accessToken: string): Promise<void> {
    const response: ApiResponse<void> = await apiClient.post('/auth/logout', {}, accessToken);
    
    if (hasApiErrors(response)) {
      // Log the error but don't throw - logout should always succeed locally
      console.warn('Logout API call failed:', response.errors);
    }
  }

  /**
   * Verify current user session
   */
  static async verifyToken(accessToken: string): Promise<User> {
    const response: ApiResponse<User> = await apiClient.get('/auth/me', accessToken);
    return extractApiData(response);
  }

  // Legacy methods for backward compatibility
  /**
   * @deprecated Use signUpPrepare and signUpVerify instead
   */
  static async register(userData: {
    phone: string;
    password: string;
    firstName: string;
    lastName?: string;
  }): Promise<JWTToken> {
    const response: ApiResponse<JWTToken> = await apiClient.post('/auth/register', userData);
    return extractApiData(response);
  }

  /**
   * @deprecated Use forgotPasswordPrepare, forgotPasswordVerify, and forgotPasswordUpdate instead
   */
  static async requestPasswordReset(phone: string): Promise<void> {
    const response: ApiResponse<void> = await apiClient.post('/auth/forgot-password', { phone });
    extractApiData(response);
  }

  /**
   * @deprecated Use forgotPasswordPrepare, forgotPasswordVerify, and forgotPasswordUpdate instead
   */
  static async resetPassword(phone: string, code: string, newPassword: string): Promise<void> {
    const response: ApiResponse<void> = await apiClient.post('/auth/reset-password', {
      phone,
      code,
      newPassword
    });
    extractApiData(response);
  }
}