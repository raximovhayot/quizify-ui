/**
 * Utility types for enhanced type safety across the application
 */

/**
 * Branded type utility for creating distinct types from primitives
 * Prevents accidental mixing of different ID types or sensitive data
 */
export type Brand<T, B> = T & { readonly __brand: B };

/**
 * Branded types for IDs to prevent mixing different entity IDs
 */
export type UserId = Brand<string, 'UserId'>;
export type QuizId = Brand<string, 'QuizId'>;
export type QuestionId = Brand<string, 'QuestionId'>;
export type SessionId = Brand<string, 'SessionId'>;
export type CourseId = Brand<string, 'CourseId'>;
export type CategoryId = Brand<string, 'CategoryId'>;
export type FileId = Brand<string, 'FileId'>;

/**
 * Branded types for sensitive data
 */
export type PhoneNumber = Brand<string, 'PhoneNumber'>;
export type Email = Brand<string, 'Email'>;
export type AccessToken = Brand<string, 'AccessToken'>;
export type RefreshToken = Brand<string, 'RefreshToken'>;
export type OTPCode = Brand<string, 'OTPCode'>;
export type Password = Brand<string, 'Password'>;
export type ApiKey = Brand<string, 'ApiKey'>;

/**
 * Branded constructors with validation
 */
export const createUserId = createBrandedConstructor<string, 'UserId'>(
  (value) => typeof value === 'string' && value.length > 0
);

export const createQuizId = createBrandedConstructor<string, 'QuizId'>(
  (value) => typeof value === 'string' && value.length > 0
);

export const createPhoneNumber = createBrandedConstructor<string, 'PhoneNumber'>(
  (value) => typeof value === 'string' && /^(?:\+?998|0)?\d{9}$/.test(value)
);

export const createEmail = createBrandedConstructor<string, 'Email'>(
  (value) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
);

export const createOTPCode = createBrandedConstructor<string, 'OTPCode'>(
  (value) => typeof value === 'string' && /^\d{6}$/.test(value)
);

export const createPassword = createBrandedConstructor<string, 'Password'>(
  (value) => typeof value === 'string' && value.length >= 8
);

/**
 * Utility type to make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Utility type to make all properties required recursively
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Utility type to pick properties by their value type
 */
export type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

/**
 * Utility type to omit properties by their value type
 */
export type OmitByType<T, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K];
};

/**
 * Utility type for nullable values
 */
export type Nullable<T> = T | null;

/**
 * Utility type for optional values
 */
export type Optional<T> = T | undefined;

/**
 * Utility type for values that can be null or undefined
 */
export type Maybe<T> = T | null | undefined;

/**
 * Utility type to extract array element type
 */
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

/**
 * Utility type to create a union of all possible paths in an object
 */
export type Paths<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? K | `${K}.${Paths<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

/**
 * Utility type to get the value type at a specific path
 */
export type PathValue<T, P extends Paths<T>> = P extends keyof T
  ? T[P]
  : P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? Rest extends Paths<T[K]>
        ? PathValue<T[K], Rest>
        : never
      : never
    : never;

/**
 * Discriminated union for loading states
 */
export type LoadingState<T, E = Error> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: E };

/**
 * Discriminated union for async operation states
 */
export type AsyncState<T, E = Error> =
  | { state: 'pending' }
  | { state: 'fulfilled'; value: T }
  | { state: 'rejected'; reason: E };

/**
 * Discriminated union for authentication states
 */
export type AuthState =
  | { status: 'unauthenticated' }
  | { status: 'loading' }
  | { status: 'authenticated'; user: { id: UserId; phone: PhoneNumber; email?: Email } }
  | { status: 'error'; error: string };

/**
 * Discriminated union for form states
 */
export type FormState<T> =
  | { status: 'idle'; data: T }
  | { status: 'validating'; data: T }
  | { status: 'submitting'; data: T }
  | { status: 'success'; data: T }
  | { status: 'error'; data: T; error: string };

/**
 * Discriminated union for data fetching states
 */
export type FetchState<T, E = Error> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T; lastUpdated: Date }
  | { status: 'error'; error: E; lastAttempt: Date };

/**
 * Discriminated union for upload states
 */
export type UploadState =
  | { status: 'idle' }
  | { status: 'uploading'; progress: number }
  | { status: 'success'; url: string }
  | { status: 'error'; error: string };

/**
 * Discriminated union for quiz states
 */
export type QuizState =
  | { status: 'not-started' }
  | { status: 'in-progress'; currentQuestion: number; totalQuestions: number }
  | { status: 'completed'; score: number; totalQuestions: number }
  | { status: 'paused'; currentQuestion: number; totalQuestions: number };

/**
 * Discriminated union for user roles with permissions
 */
export type UserRole =
  | { role: 'student'; permissions: ['view_quizzes', 'take_quizzes'] }
  | { role: 'instructor'; permissions: ['view_quizzes', 'create_quizzes', 'edit_quizzes', 'view_results'] }
  | { role: 'admin'; permissions: ['all'] };

/**
 * Discriminated union for notification types
 */
export type NotificationType =
  | { type: 'success'; message: string; duration?: number }
  | { type: 'error'; message: string; action?: { label: string; onClick: () => void } }
  | { type: 'warning'; message: string; dismissible?: boolean }
  | { type: 'info'; message: string; link?: { text: string; href: string } };

/**
 * Utility type for form field states
 */
export type FieldState<T> = {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
};

/**
 * Utility type for pagination metadata
 */
export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

/**
 * Utility type for paginated responses
 */
export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};

/**
 * Utility type for sort configuration
 */
export type SortConfig<T> = {
  field: keyof T;
  direction: 'asc' | 'desc';
};

/**
 * Utility type for filter configuration
 */
export type FilterConfig<T> = {
  [K in keyof T]?: T[K] | T[K][] | { min?: T[K]; max?: T[K] };
};

/**
 * Utility type for search and filter parameters
 */
export type SearchParams<T> = {
  query?: string;
  sort?: SortConfig<T>;
  filters?: FilterConfig<T>;
  pagination?: Pick<PaginationMeta, 'page' | 'limit'>;
};

/**
 * Utility type to ensure at least one property is present
 */
export type AtLeastOne<T> = {
  [K in keyof T]: Pick<T, K> & Partial<Omit<T, K>>;
}[keyof T];

/**
 * Utility type to ensure exactly one property is present
 */
export type ExactlyOne<T> = {
  [K in keyof T]: Pick<T, K> & Partial<Record<Exclude<keyof T, K>, never>>;
}[keyof T];

/**
 * Utility type for creating branded constructors
 */
export type BrandedConstructor<T, B> = (value: T) => Brand<T, B>;

/**
 * Helper functions for working with branded types
 */
export const createBrandedConstructor = <T, B>(
  validator?: (value: T) => boolean
): BrandedConstructor<T, B> => {
  return (value: T): Brand<T, B> => {
    if (validator && !validator(value)) {
      throw new Error('Invalid value for branded type');
    }
    return value as Brand<T, B>;
  };
};

/**
 * Helper function to extract the underlying value from a branded type
 */
export const unbrand = <T, B>(brandedValue: Brand<T, B>): T => {
  return brandedValue as T;
};

/**
 * Type guard utility
 */
export type TypeGuard<T> = (value: unknown) => value is T;

/**
 * Utility type for creating type guards
 */
export type Guards<T> = {
  [K in keyof T]: TypeGuard<T[K]>;
};
