/**
 * API endpoint type definitions for enhanced type safety
 * Provides strict typing for all API endpoints and their request/response types
 */
import { AttachmentDTO } from '@/components/features/attachment/attachmentService';
import {
  ForgotPasswordPrepareRequest,
  ForgotPasswordUpdateRequest,
  ForgotPasswordVerifyRequest,
  ForgotPasswordVerifyResponse,
  JWTToken,
  SignInPrepareResponse,
  SignInRequest,
  SignUpPrepareRequest,
  SignUpVerifyRequest,
} from '@/components/features/auth/types/auth';
import {
  InstructorQuizCreateRequest,
  InstructorQuizUpdateRequest,
  InstructorQuizUpdateStatusRequest,
  QuizDataDTO,
  QuizFilter,
} from '@/components/features/instructor/quiz/types/quiz';
import { AccountDTO } from '@/components/features/profile/types/account';

import { IApiResponse } from './api';
import { IPageableList, ISearchParams } from './common';

/**
 * HTTP methods supported by the API
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * API endpoint configuration
 */
export interface ApiEndpoint<TRequest = void, TResponse = unknown> {
  method: HttpMethod;
  path: string;
  requiresAuth?: boolean;
  requestType?: TRequest;
  responseType?: TResponse;
}

/**
 * Authentication endpoints
 */
export interface AuthEndpoints {
  signIn: ApiEndpoint<SignInRequest, JWTToken>;
  signUpPrepare: ApiEndpoint<SignUpPrepareRequest, SignInPrepareResponse>;
  signUpVerify: ApiEndpoint<SignUpVerifyRequest, JWTToken>;
  forgotPasswordPrepare: ApiEndpoint<
    ForgotPasswordPrepareRequest,
    SignInPrepareResponse
  >;
  forgotPasswordVerify: ApiEndpoint<
    ForgotPasswordVerifyRequest,
    ForgotPasswordVerifyResponse
  >;
  forgotPasswordUpdate: ApiEndpoint<ForgotPasswordUpdateRequest, string>;
  refreshToken: ApiEndpoint<{ refreshToken: string }, JWTToken>;
  logout: ApiEndpoint<void, void>;
}

/**
 * Profile endpoints
 */
export interface ProfileEndpoints {
  getProfile: ApiEndpoint<void, AccountDTO>;
  updateProfile: ApiEndpoint<Partial<AccountDTO>, AccountDTO>;
  completeProfile: ApiEndpoint<Partial<AccountDTO>, AccountDTO>;
  uploadAvatar: ApiEndpoint<FormData, { avatarUrl: string }>;
}

/**
 * Quiz endpoints for instructor operations
 */
export interface QuizEndpoints {
  getQuizzes: ApiEndpoint<QuizFilter, IPageableList<QuizDataDTO>>;
  getQuiz: ApiEndpoint<{ id: string }, QuizDataDTO>;
  createQuiz: ApiEndpoint<InstructorQuizCreateRequest, QuizDataDTO>;
  updateQuiz: ApiEndpoint<
    { id: string; data: InstructorQuizUpdateRequest },
    QuizDataDTO
  >;
  updateQuizStatus: ApiEndpoint<
    { id: string; data: InstructorQuizUpdateStatusRequest },
    void
  >;
  deleteQuiz: ApiEndpoint<{ id: string }, void>;
}

/**
 * Attachment endpoints for file management
 */
export interface AttachmentEndpoints {
  uploadAttachment: ApiEndpoint<FormData, AttachmentDTO>;
  getAttachment: ApiEndpoint<{ id: string }, AttachmentDTO>;
  deleteAttachment: ApiEndpoint<{ id: string }, void>;
}

/**
 * Complete API endpoints mapping
 */
export interface ApiEndpoints {
  auth: AuthEndpoints;
  profile: ProfileEndpoints;
  quiz: QuizEndpoints;
  attachment: AttachmentEndpoints;
}

/**
 * API endpoint paths as constants for type safety
 */
export const API_PATHS = {
  AUTH: {
    SIGN_IN: '/auth/sign-in',
    SIGN_UP_PREPARE: '/auth/sign-up/prepare',
    SIGN_UP_VERIFY: '/auth/sign-up/verify',
    FORGOT_PASSWORD_PREPARE: '/auth/forgot-password/prepare',
    FORGOT_PASSWORD_VERIFY: '/auth/forgot-password/verify',
    FORGOT_PASSWORD_UPDATE: '/auth/forgot-password/update',
    REFRESH_TOKEN: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  PROFILE: {
    GET: '/profile',
    UPDATE: '/profile',
    COMPLETE: '/profile/complete',
    UPLOAD_AVATAR: '/profile/avatar',
  },
  QUIZ: {
    LIST: '/instructor/quizzes',
    GET: '/instructor/quizzes/:id',
    CREATE: '/instructor/quizzes',
    UPDATE: '/instructor/quizzes/:id',
    UPDATE_STATUS: '/instructor/quizzes/:id/status',
    DELETE: '/instructor/quizzes/:id',
  },
  ATTACHMENT: {
    UPLOAD: '/instructor/attachments',
    GET: '/instructor/attachments/:id',
    DELETE: '/instructor/attachments/:id',
  },
} as const;

/**
 * Type-safe API endpoint definitions
 */
export const API_ENDPOINTS: ApiEndpoints = {
  auth: {
    signIn: {
      method: 'POST',
      path: API_PATHS.AUTH.SIGN_IN,
      requiresAuth: false,
    },
    signUpPrepare: {
      method: 'POST',
      path: API_PATHS.AUTH.SIGN_UP_PREPARE,
      requiresAuth: false,
    },
    signUpVerify: {
      method: 'POST',
      path: API_PATHS.AUTH.SIGN_UP_VERIFY,
      requiresAuth: false,
    },
    forgotPasswordPrepare: {
      method: 'POST',
      path: API_PATHS.AUTH.FORGOT_PASSWORD_PREPARE,
      requiresAuth: false,
    },
    forgotPasswordVerify: {
      method: 'POST',
      path: API_PATHS.AUTH.FORGOT_PASSWORD_VERIFY,
      requiresAuth: false,
    },
    forgotPasswordUpdate: {
      method: 'POST',
      path: API_PATHS.AUTH.FORGOT_PASSWORD_UPDATE,
      requiresAuth: false,
    },
    refreshToken: {
      method: 'POST',
      path: API_PATHS.AUTH.REFRESH_TOKEN,
      requiresAuth: false,
    },
    logout: {
      method: 'POST',
      path: API_PATHS.AUTH.LOGOUT,
      requiresAuth: true,
    },
  },
  profile: {
    getProfile: {
      method: 'GET',
      path: API_PATHS.PROFILE.GET,
      requiresAuth: true,
    },
    updateProfile: {
      method: 'PUT',
      path: API_PATHS.PROFILE.UPDATE,
      requiresAuth: true,
    },
    completeProfile: {
      method: 'POST',
      path: API_PATHS.PROFILE.COMPLETE,
      requiresAuth: true,
    },
    uploadAvatar: {
      method: 'POST',
      path: API_PATHS.PROFILE.UPLOAD_AVATAR,
      requiresAuth: true,
    },
  },
  quiz: {
    getQuizzes: {
      method: 'GET',
      path: API_PATHS.QUIZ.LIST,
      requiresAuth: true,
    },
    getQuiz: {
      method: 'GET',
      path: API_PATHS.QUIZ.GET,
      requiresAuth: true,
    },
    createQuiz: {
      method: 'POST',
      path: API_PATHS.QUIZ.CREATE,
      requiresAuth: true,
    },
    updateQuiz: {
      method: 'PUT',
      path: API_PATHS.QUIZ.UPDATE,
      requiresAuth: true,
    },
    updateQuizStatus: {
      method: 'PATCH',
      path: API_PATHS.QUIZ.UPDATE_STATUS,
      requiresAuth: true,
    },
    deleteQuiz: {
      method: 'DELETE',
      path: API_PATHS.QUIZ.DELETE,
      requiresAuth: true,
    },
  },
  attachment: {
    uploadAttachment: {
      method: 'POST',
      path: API_PATHS.ATTACHMENT.UPLOAD,
      requiresAuth: true,
    },
    getAttachment: {
      method: 'GET',
      path: API_PATHS.ATTACHMENT.GET,
      requiresAuth: true,
    },
    deleteAttachment: {
      method: 'DELETE',
      path: API_PATHS.ATTACHMENT.DELETE,
      requiresAuth: true,
    },
  },
};

/**
 * Type helper to extract request type from endpoint
 */
export type EndpointRequest<T> =
  T extends ApiEndpoint<infer R, unknown> ? R : never;

/**
 * Type helper to extract response type from endpoint
 */
export type EndpointResponse<T> =
  T extends ApiEndpoint<unknown, infer R> ? R : never;

/**
 * Type helper to create typed API response
 */
export type TypedApiResponse<T> = IApiResponse<T>;

/**
 * Utility type for endpoint path parameters
 */
export type PathParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & PathParams<Rest>
    : T extends `${string}:${infer Param}`
      ? { [K in Param]: string }
      : Record<string, never>;

/**
 * Type-safe path parameter extraction
 */
export type ExtractPathParams<
  T extends keyof ApiEndpoints[keyof ApiEndpoints],
> = T extends keyof AuthEndpoints
  ? PathParams<AuthEndpoints[T]['path']>
  : T extends keyof ProfileEndpoints
    ? PathParams<ProfileEndpoints[T]['path']>
    : T extends keyof QuizEndpoints
      ? PathParams<QuizEndpoints[T]['path']>
      : Record<string, never>;
