import { apiClient } from '@/lib/api';
import { ApiResponse } from '@/types/api';

/**
 * Profile update request interface matching backend UpdateDetailsRequest
 */
export interface UpdateDetailsRequest {
  firstName: string;
  lastName: string;
  language: 'EN' | 'UZ' | 'RU';
  dashboardType: 'STUDENT' | 'INSTRUCTOR';
}

/**
 * Password update request interface matching backend UpdatePasswordRequest
 */
export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Account DTO interface matching backend AccountDTO
 */
export interface AccountDTO {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  roles: string[];
  state: string;
  language: 'EN' | 'UZ' | 'RU';
  dashboardType: 'STUDENT' | 'INSTRUCTOR';
}

/**
 * Profile API service for managing user profile operations
 */
export class ProfileApiService {
  /**
   * Get current user profile
   */
  static async getCurrentProfile(token: string): Promise<ApiResponse<AccountDTO>> {
    return apiClient.get<AccountDTO>('/account/me', token);
  }

  /**
   * Update user profile details
   */
  static async updateDetails(
    request: UpdateDetailsRequest,
    token: string
  ): Promise<ApiResponse<AccountDTO>> {
    return apiClient.put<AccountDTO>('/account', request, token);
  }

  /**
   * Update user password
   */
  static async updatePassword(
    request: UpdatePasswordRequest,
    token: string
  ): Promise<ApiResponse<string>> {
    return apiClient.put<string>('/account/password', request, token);
  }
}