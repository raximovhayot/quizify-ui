/**
 * Profile-related type definitions based on backend-filesystem MCP server
 */

import { Language } from './common';
import { AccountDTO } from './auth';

// Profile update types based on backend
export interface UpdateDetailsRequest {
  firstName: string;
  lastName: string;
  language: Language;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// User DTO based on backend
export type UserDTO = AccountDTO;

// Response types for profile APIs
export type ProfileDetailsResponse = AccountDTO;
export type UpdateProfileResponse = AccountDTO;

// Legacy types for backward compatibility
export type UpdateProfileRequest = UpdateDetailsRequest;