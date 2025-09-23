/**
 * Account-related type definitions
 * This file contains all account/user/profile related types and interfaces
 */
import { Language } from '@/types/common';

// User state enum based on backend-filesystem MCP server
export enum UserState {
  NEW = 'new',
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  DELETED = 'deleted',
}

// User role enum to match backend
export enum UserRole {
  ADMIN = 'ADMIN',
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT',
}

// Dashboard type enum to match backend
export enum DashboardType {
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT',
}

// Role DTO based on backend-filesystem MCP server
export interface RoleDTO {
  id: number;
  name: string;
  description: string;
}

// Account DTO based on backend-filesystem MCP server (matches backend AccountDTO)
export interface AccountDTO {
  id: number;
  firstName: string;
  lastName: string;
  roles: RoleDTO[];
  phone: string;
  state: UserState;
  language: Language;
  dashboardType?: DashboardType;
}

// Account completion request for the final step of sign-up
export interface AccountCompleteRequest {
  firstName: string;
  lastName: string;
  password: string;
  dashboardType: DashboardType;
}

// PUT /account - Update user details
export interface UpdateDetailsRequest {
  firstName: string;
  lastName: string;
  language: Language;
  dashboardType: DashboardType;
}

// PUT /account/password - Update user password
export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Helper functions for role checking
export function hasRole(user: AccountDTO | null, roleName: string): boolean {
  return user?.roles?.some((role) => role.name === roleName) ?? false;
}

export function hasAnyRole(
  user: AccountDTO | null,
  roleNames: string[]
): boolean {
  return user?.roles?.some((role) => roleNames.includes(role.name)) ?? false;
}
