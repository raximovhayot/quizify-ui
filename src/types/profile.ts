/**
 * Profile-related type definitions based on AccountController from backend MCP server
 */

import { Language, UserState } from './common';
import { AccountDTO, DashboardType, RoleDTO } from './auth';

// Generic Response wrapper type used by all backend APIs
export interface Response<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp?: string;
}

// AccountController API Types based on backend analysis

// PUT /account/complete - Complete user profile after registration
// Note: AccountCompleteRequest is defined in auth.ts since it's part of the auth flow
export type AccountCompleteResponse = Response<AccountDTO>;

// GET /account/me - Get current user profile
export type GetCurrentUserProfileResponse = Response<AccountDTO>;

// PUT /account - Update user details
export interface UpdateDetailsRequest {
  firstName: string;
  lastName: string;
  language: Language;
  dashboardType: DashboardType;
}

export type UpdateDetailsResponse = Response<AccountDTO>;

// PUT /account/password - Update user password
export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export type UpdatePasswordResponse = Response<string>;

// Re-export AccountDTO and related types for convenience
export type { AccountDTO, RoleDTO };
export { DashboardType, Language, UserState };

// Legacy types for backward compatibility
export type UserDTO = AccountDTO;
export type ProfileDetailsResponse = AccountDTO;
export type UpdateProfileResponse = AccountDTO;
export type UpdateProfileRequest = UpdateDetailsRequest;