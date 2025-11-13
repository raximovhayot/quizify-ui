// Common API types
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ApiError {
  message: string;
  errorCode?: string;
  timestamp?: string;
  path?: string;
}

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
  role: 'INSTRUCTOR' | 'STUDENT';
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
