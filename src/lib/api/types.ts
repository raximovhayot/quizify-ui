// Auth types
export interface SignInRequest {
  phone: string;
  password: string;
}

export interface SignUpPrepareRequest {
  phone: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'MANAGER';
}

export interface SignUpVerifyRequest {
  phone: string;
  code: string;
}

export interface JWTTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
