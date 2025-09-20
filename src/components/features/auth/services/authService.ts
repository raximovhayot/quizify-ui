import {
  ForgotPasswordPrepareRequest,
  ForgotPasswordUpdateRequest,
  ForgotPasswordVerifyRequest,
  ForgotPasswordVerifyResponse,
  JWTToken,
  RefreshTokenRequest,
  SignInPrepareResponse,
  SignInRequest,
  SignUpPrepareRequest,
  SignUpVerifyRequest,
} from '@/components/features/auth/types/auth';
import { apiClient } from '@/lib/api';
import { IApiResponse } from '@/types/api';

export class AuthService {
  // ============================================================================
  // SIGN-IN METHODS
  // ============================================================================

  static async signIn(
    phone: string,
    password: string
  ): Promise<IApiResponse<JWTToken>> {
    const request: SignInRequest = { phone, password };
    return await apiClient.post('/auth/sign-in', request);
  }

  // ============================================================================
  // SIGN-UP METHODS
  // ============================================================================

  /**
   * Initiate sign-up process by sending OTP to phone number
   *
   * @param phone - User's phone number in international format
   * @returns Promise resolving to preparation response with phone and waiting time
   * @throws BackendError if phone is invalid or rate limit exceeded
   *
   * @example
   * ```typescript
   * const response = await AuthService.signUpPrepare('+998901234567');
   * console.log(`OTP sent to ${response.phoneNumber}, wait ${response.waitingTime} seconds`);
   * ```
   */
  static async signUpPrepare(
    phone: string
  ): Promise<IApiResponse<SignInPrepareResponse>> {
    const request: SignUpPrepareRequest = { phone };
    const response: IApiResponse<SignInPrepareResponse> = await apiClient.post(
      '/auth/sign-up/prepare',
      request
    );
    return response;
  }

  /**
   * Verify sign-up OTP and create user account (step 2 of sign-up process)
   *
   * @param data - Verification request containing phone and OTP
   * @returns Promise resolving to JWT token with user data (user state: NEW)
   * @throws BackendError if OTP is invalid or expired
   *
   * @example
   * ```typescript
   * const jwtToken = await AuthService.signUpVerify({
   *   phone: '+998901234567',
   *   otp: '123456'
   * });
   * // User is now signed in but needs to complete profile
   * ```
   */
  static async signUpVerify(
    data: SignUpVerifyRequest
  ): Promise<IApiResponse<JWTToken>> {
    const response: IApiResponse<JWTToken> = await apiClient.post(
      '/auth/sign-up/verify',
      data
    );
    return response;
  }

  // ============================================================================
  // FORGOT PASSWORD METHODS
  // ============================================================================

  /**
   * Initiate forgot password process by sending OTP to phone number
   *
   * @param phone - User's registered phone number
   * @returns Promise resolving to preparation response with phone and waiting time
   * @throws BackendError if user not found or rate limit exceeded
   *
   * @example
   * ```typescript
   * const response = await AuthService.forgotPasswordPrepare('+998901234567');
   * console.log(`Reset code sent, wait ${response.waitingTime} seconds before resend`);
   * ```
   */
  static async forgotPasswordPrepare(
    phone: string
  ): Promise<IApiResponse<SignInPrepareResponse>> {
    const request: ForgotPasswordPrepareRequest = { phone };
    const response: IApiResponse<SignInPrepareResponse> = await apiClient.post(
      '/auth/forgot-password/prepare',
      request
    );
    return response;
  }

  /**
   * Verify forgot password OTP and get verification token
   *
   * @param phone - User's phone number
   * @param otp - 6-digit OTP code received via SMS
   * @returns Promise resolving to verification response with token and validity period
   * @throws BackendError if OTP is invalid or expired
   *
   * @example
   * ```typescript
   * const response = await AuthService.forgotPasswordVerify('+998901234567', '123456');
   * console.log(`Token valid for ${response.validityPeriod} seconds`);
   * ```
   */
  static async forgotPasswordVerify(
    phone: string,
    otp: string
  ): Promise<IApiResponse<ForgotPasswordVerifyResponse>> {
    const request: ForgotPasswordVerifyRequest = { phone, otp };
    const response: IApiResponse<ForgotPasswordVerifyResponse> =
      await apiClient.post('/auth/forgot-password/verify', request);
    return response;
  }

  /**
   * Update user password using verification token
   *
   * @param token - Verification token from forgotPasswordVerify step
   * @param newPassword - New password for the user account
   * @returns Promise resolving to success message
   * @throws BackendError if token is invalid/expired or password validation fails
   *
   * @example
   * ```typescript
   * const message = await AuthService.forgotPasswordUpdate(verificationToken, 'newPassword123');
   * console.log(message); // Success message
   * ```
   */
  static async forgotPasswordUpdate(
    token: string,
    newPassword: string
  ): Promise<IApiResponse<string>> {
    const request: ForgotPasswordUpdateRequest = { token, newPassword };
    const response: IApiResponse<string> = await apiClient.post(
      '/auth/forgot-password/update',
      request
    );
    return response;
  }

  // ============================================================================
  // TOKEN MANAGEMENT METHODS
  // ============================================================================

  /**
   * Refresh JWT access token using refresh token
   *
   * @param refreshToken - Valid refresh token
   * @returns Promise resolving to new JWT token pair
   * @throws BackendError if refresh token is invalid or expired
   *
   * @example
   * ```typescript
   * const newTokens = await AuthService.refreshToken(storedRefreshToken);
   * // Store new tokens and update authentication state
   * ```
   */
  static async refreshToken(
    refreshToken: string
  ): Promise<IApiResponse<JWTToken>> {
    const request: RefreshTokenRequest = { refreshToken };
    const response: IApiResponse<JWTToken> = await apiClient.post(
      '/auth/refresh-token',
      request
    );
    return response;
  }

  /**
   * Logout user (client-side only - JWT tokens are stateless)
   *
   * This method doesn't make any backend calls since JWT tokens are stateless.
   * The actual logout logic (clearing tokens, redirecting) should be handled
   * by NextAuth or the calling component.
   *
   * @returns Promise resolving immediately
   *
   * @example
   * ```typescript
   * await AuthService.logout();
   * // Clear local storage, cookies, and redirect to sign-in
   * ```
   */
  static async logout(): Promise<void> {
    // JWT tokens are stateless, so logout is handled entirely on the client side
    // No backend call needed - tokens will expire naturally
    return Promise.resolve();
  }
}
