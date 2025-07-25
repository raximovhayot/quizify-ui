import { AccountDTO } from "./account";

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