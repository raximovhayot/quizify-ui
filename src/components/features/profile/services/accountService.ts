import {
  AccountCompleteRequest,
  AccountDTO,
  UpdatePasswordRequest,
} from '@/components/features/profile/types/account';
import { apiClient } from '@/lib/api';
import { IApiResponse, extractApiData } from '@/types/api';

/**
 * AccountService - Handles account-related operations
 *
 * This services provides methods for managing user account operations
 * such as completing account setup and profile management.
 */
export class AccountService {
  // ============================================================================
  // ACCOUNT MANAGEMENT METHODS
  // ============================================================================

  /**
   * Fetch the current user's profile
   */
  static async getProfile(signal?: AbortSignal): Promise<AccountDTO> {
    const response: IApiResponse<AccountDTO> = await apiClient.get(
      '/account/me',
      { signal }
    );
    return extractApiData(response);
  }

  /**
   * Update current user's profile details
   */
  static async updateProfile(
    data: Partial<AccountDTO>
  ): Promise<IApiResponse<AccountDTO>> {
    const response: IApiResponse<AccountDTO> = await apiClient.put(
      '/account',
      data
    );
    return response;
  }

  /**
   * Complete user account setup with profile information
   *
   * This method is used to finalize account creation by providing
   * personal information and setting up the user's dashboard type.
   *
   * @param data - Account completion data including name, password, and dashboard type
   * @param accessToken - JWT access token for authentication
   * @returns Promise resolving to complete account information
   * @throws BackendError if validation fails or account completion is not allowed
   *
   */
  static async completeAccount(
    data: AccountCompleteRequest
  ): Promise<IApiResponse<AccountDTO>> {
    const response: IApiResponse<AccountDTO> = await apiClient.put(
      '/account/complete',
      data
    );
    return response;
  }

  /**
   * Change current user's password
   */
  static async changePassword(
    data: UpdatePasswordRequest
  ): Promise<IApiResponse<string>> {
    const response: IApiResponse<string> = await apiClient.put(
      '/account/password',
      data
    );
    return response;
  }
}
