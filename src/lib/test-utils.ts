/**
 * Comprehensive testing utilities
 * 
 * Provides test utilities for common patterns, mock factories for API responses,
 * and component testing helpers to ensure consistent and reliable testing
 * throughout the Quizify UI application.
 * 
 * @fileoverview Testing utilities and helpers
 * @version 1.0.0
 * @since 2025-01-01
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { ReactElement, ReactNode, createElement } from 'react';
import { UseFormReturn } from 'react-hook-form';

import { ApiResponse, ApiError } from '@/types/api';
import { 
  JWTToken, 
  SignInPrepareResponse, 
  ForgotPasswordVerifyResponse 
} from '@/components/features/auth/types/auth';
import { AccountDTO } from '@/components/features/profile/types/account';
import { PageableList } from '@/types/common';
import { 
  UserId, 
  QuizId, 
  PhoneNumber, 
  Email, 
  OTPCode,
  createUserId,
  createQuizId,
  createPhoneNumber,
  createEmail,
  createOTPCode,
} from '@/types/utils';

// =============================================================================
// MOCK DATA FACTORIES
// =============================================================================

/**
 * Factory for creating mock user data
 */
export const createMockUser = (overrides?: Partial<AccountDTO>): AccountDTO => ({
  id: 'user-123',
  phone: '+998901234567',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'STUDENT',
  profileCompleted: true,
  avatarUrl: 'https://example.com/avatar.jpg',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

/**
 * Factory for creating mock JWT tokens
 */
export const createMockJWTToken = (overrides?: Partial<JWTToken>): JWTToken => ({
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  user: createMockUser(),
  ...overrides,
});

/**
 * Factory for creating mock API responses
 */
export const createMockApiResponse = <T>(
  data: T,
  errors: ApiError[] = []
): ApiResponse<T> => ({
  data,
  errors,
});

/**
 * Factory for creating mock API errors
 */
export const createMockApiError = (
  code = 'MOCK_ERROR',
  message = 'Mock error message',
  field?: string
): ApiError => ({
  code,
  message,
  field,
});

/**
 * Factory for creating mock pageable lists
 */
export const createMockPageableList = <T>(
  items: T[],
  overrides?: Partial<PageableList<T>>
): PageableList<T> => ({
  content: items,
  totalElements: items.length,
  totalPages: 1,
  size: items.length,
  page: 0,
  first: true,
  last: true,
  empty: items.length === 0,
  ...overrides,
});

/**
 * Factory for creating mock sign-in prepare responses
 */
export const createMockSignInPrepareResponse = (
  overrides?: Partial<SignInPrepareResponse>
): SignInPrepareResponse => ({
  phoneNumber: '+998901234567',
  waitingTime: 60,
  ...overrides,
});

/**
 * Factory for creating mock forgot password verify responses
 */
export const createMockForgotPasswordVerifyResponse = (
  overrides?: Partial<ForgotPasswordVerifyResponse>
): ForgotPasswordVerifyResponse => ({
  token: 'mock-reset-token',
  validityPeriod: 300,
  ...overrides,
});

// =============================================================================
// BRANDED TYPE FACTORIES
// =============================================================================

/**
 * Factory for creating mock branded types
 */
export const mockBrandedTypes = {
  userId: (id = 'user-123'): UserId => createUserId(id),
  quizId: (id = 'quiz-123'): QuizId => createQuizId(id),
  phoneNumber: (phone = '+998901234567'): PhoneNumber => createPhoneNumber(phone),
  email: (email = 'test@example.com'): Email => createEmail(email),
  otpCode: (code = '123456'): OTPCode => createOTPCode(code),
};

// =============================================================================
// FORM TESTING UTILITIES
// =============================================================================

/**
 * Mock form return object for testing form components
 */
export const createMockFormReturn = <T extends Record<string, unknown>>(
  defaultValues: T,
  overrides?: Partial<UseFormReturn<T>>
): UseFormReturn<T> => ({
  control: {} as UseFormReturn<T>['control'],
  register: jest.fn(() => ({
    onChange: jest.fn(),
    onBlur: jest.fn(),
    name: 'mockField',
    ref: jest.fn(),
  })),
  handleSubmit: jest.fn((onValid) => jest.fn((e) => {
    e?.preventDefault();
    onValid(defaultValues);
  })),
  watch: jest.fn(() => defaultValues),
  getValues: jest.fn(() => defaultValues),
  setValue: jest.fn(),
  reset: jest.fn(),
  setError: jest.fn(),
  clearErrors: jest.fn(),
  trigger: jest.fn(() => Promise.resolve(true)),
  formState: {
    errors: {},
    isDirty: false,
    isValid: true,
    isSubmitting: false,
    isLoading: false,
    isSubmitted: false,
    isSubmitSuccessful: false,
    isValidating: false,
    submitCount: 0,
    touchedFields: {},
    dirtyFields: {},
    validatingFields: {},
    defaultValues,
  },
  setFocus: jest.fn(),
  getFieldState: jest.fn(() => ({
    invalid: false,
    isDirty: false,
    isTouched: false,
    error: undefined,
  })),
  resetField: jest.fn(),
  unregister: jest.fn(),
  ...overrides,
});

/**
 * Utility for testing form validation
 */
export const testFormValidation = async (
  schema: (t: (key: string) => string) => unknown,
  validData: Record<string, unknown>,
  invalidData: Record<string, unknown>
) => {
  const mockT = (key: string) => key;
  const validationSchema = schema(mockT);
  
  // Test valid data
  expect(() => (validationSchema as { parse: (data: unknown) => unknown }).parse(validData)).not.toThrow();
  
  // Test invalid data
  expect(() => (validationSchema as { parse: (data: unknown) => unknown }).parse(invalidData)).toThrow();
};

// =============================================================================
// API TESTING UTILITIES
// =============================================================================

/**
 * Mock API client for testing
 */
export const createMockApiClient = () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  request: jest.fn(),
});

/**
 * Utility for testing API responses
 */
export const expectApiResponse = <T>(
  response: ApiResponse<T>,
  expectedData?: T,
  expectedErrors?: ApiError[]
) => {
  if (expectedData !== undefined) {
    expect(response.data).toEqual(expectedData);
  }
  
  if (expectedErrors !== undefined) {
    expect(response.errors).toEqual(expectedErrors);
  }
  
  expect(response).toHaveProperty('data');
  expect(response).toHaveProperty('errors');
  expect(Array.isArray(response.errors)).toBe(true);
};

/**
 * Utility for testing error responses
 */
export const expectApiError = (
  response: ApiResponse<unknown>,
  expectedCode?: string,
  expectedMessage?: string
) => {
  expect(response.errors.length).toBeGreaterThan(0);
  
  if (expectedCode) {
    expect(response.errors[0]?.code).toBe(expectedCode);
  }
  
  if (expectedMessage) {
    expect(response.errors[0]?.message).toBe(expectedMessage);
  }
};

// =============================================================================
// REACT QUERY TESTING UTILITIES
// =============================================================================

/**
 * Create a test query client with default configuration
 */
export const createTestQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

/**
 * Wrapper component for testing React Query hooks
 */
export const createQueryClientWrapper = (queryClient?: QueryClient) => {
  const client = queryClient || createTestQueryClient();
  const QueryWrapper = ({ children }: { children: ReactNode }) => 
    createElement(QueryClientProvider, { client }, children);
  
  QueryWrapper.displayName = 'QueryClientWrapper';
  return QueryWrapper;
};

// =============================================================================
// COMPONENT TESTING UTILITIES
// =============================================================================

/**
 * Custom render function with providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  initialEntries?: string[];
}

export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult & { queryClient: QueryClient } => {
  const { queryClient = createTestQueryClient(), ...renderOptions } = options;

  const Wrapper = createQueryClientWrapper(queryClient);

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
};

/**
 * Utility for testing component props
 */
export const expectComponentProps = <T extends Record<string, unknown>>(
  component: { props: T },
  expectedProps: Partial<T>
) => {
  Object.entries(expectedProps).forEach(([key, value]) => {
    expect(component.props[key]).toEqual(value);
  });
};

/**
 * Utility for testing component rendering
 */
export const expectComponentToRender = (component: RenderResult) => {
  expect(component.container).toBeInTheDocument();
  expect(component.container.firstChild).not.toBeNull();
};

// =============================================================================
// ASYNC TESTING UTILITIES
// =============================================================================

/**
 * Utility for testing async operations with timeout
 */
export const waitForAsync = async <T>(
  asyncFn: () => Promise<T>,
  timeout = 5000
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Async operation timed out after ${timeout}ms`));
    }, timeout);

    asyncFn()
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timeoutId));
  });
};

/**
 * Utility for testing loading states
 */
export const expectLoadingState = (
  result: { isLoading?: boolean; isPending?: boolean }
) => {
  expect(result.isLoading || result.isPending).toBe(true);
};

/**
 * Utility for testing success states
 */
export const expectSuccessState = <T>(
  result: { isSuccess?: boolean; data?: T },
  expectedData?: T
) => {
  expect(result.isSuccess).toBe(true);
  
  if (expectedData !== undefined) {
    expect(result.data).toEqual(expectedData);
  }
};

/**
 * Utility for testing error states
 */
export const expectErrorState = (
  result: { isError?: boolean; error?: unknown },
  expectedError?: unknown
) => {
  expect(result.isError).toBe(true);
  
  if (expectedError !== undefined) {
    expect(result.error).toEqual(expectedError);
  }
};

// =============================================================================
// MOCK IMPLEMENTATIONS
// =============================================================================

/**
 * Mock localStorage for testing
 */
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    length: Object.keys(store).length,
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
};

/**
 * Mock sessionStorage for testing
 */
export const mockSessionStorage = mockLocalStorage;

/**
 * Mock fetch for testing API calls
 */
export const mockFetch = (
  response: unknown,
  options: { status?: number; ok?: boolean } = {}
) => {
  const { status = 200, ok = true } = options;
  
  return jest.fn(() =>
    Promise.resolve({
      ok,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
      headers: new Headers(),
      statusText: ok ? 'OK' : 'Error',
    } as Response)
  );
};

// =============================================================================
// TEST SETUP UTILITIES
// =============================================================================

/**
 * Common test setup for components
 */
export const setupComponentTest = () => {
  // Mock window.location
  const originalLocation = window.location;
  delete (window as { location?: unknown }).location;
  window.location = {
    ...originalLocation,
    hostname: 'localhost',
    href: 'http://localhost:3000',
    reload: jest.fn(),
  };

  // Mock console methods to avoid noise in tests
  const originalConsole = { ...console };
  console.warn = jest.fn();
  console.error = jest.fn();
  console.log = jest.fn();

  return {
    cleanup: () => {
      window.location = originalLocation;
      Object.assign(console, originalConsole);
    },
  };
};

/**
 * Common test setup for API tests
 */
export const setupApiTest = () => {
  const mockApiClient = createMockApiClient();
  const originalFetch = global.fetch;
  
  // Mock global fetch
  global.fetch = mockFetch({});

  return {
    mockApiClient,
    cleanup: () => {
      global.fetch = originalFetch;
    },
  };
};

// =============================================================================
// ASSERTION HELPERS
// =============================================================================

/**
 * Custom matchers for better test assertions
 */
export const customMatchers = {
  /**
   * Check if an API response is successful
   */
  toBeSuccessfulApiResponse: <T>(response: ApiResponse<T>) => {
    const pass = response.errors.length === 0 && response.data !== null;
    return {
      pass,
      message: () => 
        pass 
          ? 'Expected API response to not be successful'
          : `Expected API response to be successful, but got errors: ${JSON.stringify(response.errors)}`,
    };
  },

  /**
   * Check if an API response has errors
   */
  toHaveApiErrors: <T>(response: ApiResponse<T>, expectedCount?: number) => {
    const hasErrors = response.errors.length > 0;
    const countMatches = expectedCount === undefined || response.errors.length === expectedCount;
    const pass = hasErrors && countMatches;
    
    return {
      pass,
      message: () => 
        pass 
          ? 'Expected API response to not have errors'
          : `Expected API response to have ${expectedCount || 'some'} errors, but got ${response.errors.length}`,
    };
  },
};

// =============================================================================
// EXPORT ALL UTILITIES
// =============================================================================

/**
 * Main testing utilities object for easy importing
 */
export const testUtils = {
  // Factories
  createMockUser,
  createMockJWTToken,
  createMockApiResponse,
  createMockApiError,
  createMockPageableList,
  createMockSignInPrepareResponse,
  createMockForgotPasswordVerifyResponse,
  mockBrandedTypes,
  
  // Form utilities
  createMockFormReturn,
  testFormValidation,
  
  // API utilities
  createMockApiClient,
  expectApiResponse,
  expectApiError,
  
  // React Query utilities
  createTestQueryClient,
  createQueryClientWrapper,
  
  // Component utilities
  renderWithProviders,
  expectComponentProps,
  expectComponentToRender,
  
  // Async utilities
  waitForAsync,
  expectLoadingState,
  expectSuccessState,
  expectErrorState,
  
  // Mock implementations
  mockLocalStorage,
  mockSessionStorage,
  mockFetch,
  
  // Setup utilities
  setupComponentTest,
  setupApiTest,
  
  // Custom matchers
  customMatchers,
};