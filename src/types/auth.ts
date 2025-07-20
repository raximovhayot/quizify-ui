import {Language} from "@/types/common";

export enum UserRole {
  STUDENT,
  INSTRUCTOR
}

export enum UserState {
  NEW,
  ACTIVE,
  BLOCKED
}

export interface User {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  state: UserState;
  language: Language;
}

export interface AuthContextType {
  user: User | null;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface SignInRequest {
  phone: string;
  password: string;
}

// we use this as a sign in response, sign up verify response, refresh token response
export interface JWTToken {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface SignUpPrepareRequest {
    phone: string;
}

export interface SignUpPrepareResponse {

}