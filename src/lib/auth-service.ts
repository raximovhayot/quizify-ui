import { apiClient } from './api';
import { User } from '@/types/auth';
import { ApiResponse, hasApiErrors, extractApiData } from '@/types/api';

/**
 * Login request payload
 */
export interface LoginRequest {
  phone: string;
  password: string;
}

/**
 * Login response data
 */
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Token refresh response
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

/**
 * Authentication service for handling all auth-related API calls
 */
export class AuthService {
  /**
   * Authenticate user with phone and password
   */
  static async login(phone: string, password: string): Promise<LoginResponse> {
    const response: ApiResponse<LoginResponse> = await apiClient.post('/auth/login', {
      phone,
      password
    });

    return extractApiData(response);
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response: ApiResponse<RefreshTokenResponse> = await apiClient.post('/auth/refresh', {
      refreshToken
    });

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

  /**
   * Register new user
   */
  static async register(userData: {
    phone: string;
    password: string;
    firstName: string;
    lastName?: string;
  }): Promise<LoginResponse> {
    const response: ApiResponse<LoginResponse> = await apiClient.post('/auth/register', userData);
    return extractApiData(response);
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(phone: string): Promise<void> {
    const response: ApiResponse<void> = await apiClient.post('/auth/forgot-password', { phone });
    extractApiData(response);
  }

  /**
   * Reset password with code
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