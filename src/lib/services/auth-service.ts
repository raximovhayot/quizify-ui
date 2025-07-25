import { apiClient } from '../api';
import { 
  JWTToken,
  SignInRequest,
  SignUpPrepareRequest,
  SignInPrepareResponse,
  SignUpVerifyRequest,
  ForgotPasswordPrepareRequest,
  ForgotPasswordVerifyRequest,
  ForgotPasswordVerifyResponse,
  ForgotPasswordUpdateRequest,
  RefreshTokenRequest
} from '@/types/auth';
import { AccountDTO, AccountCompleteRequest } from '@/types/account';
import { ApiResponse, extractApiData } from '@/types/api';

/**
 * Authentication service for handling all auth-related API calls
 * 
 * This service provides a unified interface for all authentication operations including:
 * - Sign-in with phone and password
 * - Sign-up with OTP verification and account completion
 * - Forgot password flow with OTP verification
 * - Token management (refresh, verification)
 * 
 * All methods follow consistent patterns:
 * - Use typed request/response interfaces
 * - Handle API responses through extractApiData utility
 * - Throw BackendError for proper error handling
 * - Return Promise-based results for async operations
 * 
 * @example
 * ```typescript
 * // Sign in user
 * const jwtToken = await AuthService.signIn('+998901234567', 'password123');
 * 
 * // Start sign-up process
 * const prepareResponse = await AuthService.signUpPrepare('+998901234567');
 * const jwtToken = await AuthService.signUpVerify({ phone: '+998901234567', otp: '123456' });
 * const account = await AuthService.completeAccount(accountData, jwtToken.accessToken);
 * ```
 */
export class AuthService {
  // ============================================================================
  // SIGN-IN METHODS
  // ============================================================================

  /**
   * Authenticate user with phone number and password
   * 
   * @param phone - User's phone number in international format (e.g., +998901234567)
   * @param password - User's password
   * @returns Promise resolving to JWT token with user data
   * @throws BackendError if authentication fails
   * 
   * @example
   * ```typescript
   * const jwtToken = await AuthService.signIn('+998901234567', 'myPassword123');
   * console.log(jwtToken.user.firstName); // Access user data
   * ```
   */
  static async signIn(phone: string, password: string): Promise<JWTToken> {
    const request: SignInRequest = { phone, password };
    const response: ApiResponse<JWTToken> = await apiClient.post('/auth/sign-in', request);
    return extractApiData(response);
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
  static async signUpPrepare(phone: string): Promise<SignInPrepareResponse> {
    const request: SignUpPrepareRequest = { phone };
    const response: ApiResponse<SignInPrepareResponse> = await apiClient.post('/auth/sign-up/prepare', request);
    return extractApiData(response);
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
  static async signUpVerify(data: SignUpVerifyRequest): Promise<JWTToken> {
    const response: ApiResponse<JWTToken> = await apiClient.post('/auth/sign-up/verify', data);
    return extractApiData(response);
  }

  /**
   * Complete user account profile (step 3 of sign-up process)
   * 
   * @param data - Account completion data (name, password, dashboard type)
   * @param accessToken - JWT access token from signUpVerify step
   * @returns Promise resolving to updated account data
   * @throws BackendError if token is invalid or data validation fails
   * 
   * @example
   * ```typescript
   * const account = await AuthService.completeAccount({
   *   firstName: 'John',
   *   lastName: 'Doe',
   *   password: 'newPassword123',
   *   dashboardType: DashboardType.STUDENT
   * }, accessToken);
   * ```
   */
  static async completeAccount(data: AccountCompleteRequest, accessToken: string): Promise<AccountDTO> {
    const response: ApiResponse<AccountDTO> = await apiClient.put('/account/complete', data, accessToken);
    return extractApiData(response);
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
  static async forgotPasswordPrepare(phone: string): Promise<SignInPrepareResponse> {
    const request: ForgotPasswordPrepareRequest = { phone };
    const response: ApiResponse<SignInPrepareResponse> = await apiClient.post('/auth/forgot-password/prepare', request);
    return extractApiData(response);
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
  static async forgotPasswordVerify(phone: string, otp: string): Promise<ForgotPasswordVerifyResponse> {
    const request: ForgotPasswordVerifyRequest = { phone, otp };
    const response: ApiResponse<ForgotPasswordVerifyResponse> = await apiClient.post('/auth/forgot-password/verify', request);
    return extractApiData(response);
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
  static async forgotPasswordUpdate(token: string, newPassword: string): Promise<string> {
    const request: ForgotPasswordUpdateRequest = { token, newPassword };
    const response: ApiResponse<string> = await apiClient.post('/auth/forgot-password/update', request);
    return extractApiData(response);
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
  static async refreshToken(refreshToken: string): Promise<JWTToken> {
    const request: RefreshTokenRequest = { refreshToken };
    const response: ApiResponse<JWTToken> = await apiClient.post('/auth/refresh-token', request);
    return extractApiData(response);
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