import { Language, UserState } from "@/types/common";

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
}

// Helper functions for role checking
export function hasRole(user: AccountDTO | null, roleName: string): boolean {
  return user?.roles?.some(role => role.name === roleName) ?? false;
}

export function hasAnyRole(user: AccountDTO | null, roleNames: string[]): boolean {
  return user?.roles?.some(role => roleNames.includes(role.name)) ?? false;
}


// Authentication request/response types based on backend-filesystem MCP server

export interface SignInRequest {
  phone: string;
  password: string;
}

export interface JWTToken<T = AccountDTO> {
  accessToken: string;
  refreshToken: string;
  user: T;
}

export interface SignUpPrepareRequest {
  phone: string;
}

export interface SignInPrepareResponse {
  phoneNumber: string;
  waitingTime: number;
}

export interface SignUpVerifyRequest {
  phone: string;
  otp: string;
}

// User role enum to match backend
export enum UserRole {
  ADMIN = 'ADMIN',
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT'
}

// Dashboard type enum to match backend
export enum DashboardType {
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT'
}

// Account completion request for the final step of sign-up
export interface AccountCompleteRequest {
  firstName: string;
  lastName: string;
  password: string;
  dashboardType: DashboardType;
}

export interface ForgotPasswordPrepareRequest {
  phone: string;
}

export interface ForgotPasswordVerifyRequest {
  phone: string;
  otp: string;
}

export interface ForgotPasswordVerifyResponse {
  token: string;
  validityPeriod: number;
}

export interface ForgotPasswordUpdateRequest {
  token: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export { UserState };
