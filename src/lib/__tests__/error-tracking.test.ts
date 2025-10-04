/**
 * Tests for Error Tracking Utility
 *
 * @group unit
 */

import * as Sentry from '@sentry/nextjs';

import {
  ErrorSeverity,
  addBreadcrumb,
  captureException,
  captureMessage,
  clearUserContext,
  isSentryEnabled,
  setUserContext,
  testErrorTracking,
  withErrorTracking,
} from '../error-tracking';

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setUser: jest.fn(),
  setTags: jest.fn(),
  setContext: jest.fn(),
  setTag: jest.fn(),
  addBreadcrumb: jest.fn(),
  startTransaction: jest.fn(() => ({
    finish: jest.fn(),
    setStatus: jest.fn(),
  })),
  lastEventId: jest.fn(() => 'test-event-id'),
  showReportDialog: jest.fn(),
}));

// Mock security logger
jest.mock('../security-logger', () => ({
  logErrorBoundary: jest.fn(),
}));

describe('Error Tracking Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: Sentry disabled
    process.env.NEXT_PUBLIC_ENABLE_SENTRY = 'false';
    process.env.NEXT_PUBLIC_SENTRY_DSN = '';
  });

  describe('isSentryEnabled', () => {
    it('should return false when Sentry is disabled', () => {
      expect(isSentryEnabled()).toBe(false);
    });

    it('should return false when DSN is missing', () => {
      process.env.NEXT_PUBLIC_ENABLE_SENTRY = 'true';
      expect(isSentryEnabled()).toBe(false);
    });

    it('should return true when Sentry is enabled and DSN is set', () => {
      process.env.NEXT_PUBLIC_ENABLE_SENTRY = 'true';
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123';
      expect(isSentryEnabled()).toBe(true);
    });
  });

  describe('captureException', () => {
    it('should not call Sentry when disabled', () => {
      const error = new Error('Test error');
      captureException(error);
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });

    it('should call Sentry when enabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_SENTRY = 'true';
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123';

      const error = new Error('Test error');
      captureException(error);

      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        level: ErrorSeverity.ERROR,
      });
    });

    it('should set user context when provided', () => {
      process.env.NEXT_PUBLIC_ENABLE_SENTRY = 'true';
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123';

      const error = new Error('Test error');
      captureException(error, {
        userId: 'user123',
        userEmail: 'test@example.com',
      });

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'user123',
        email: 'test@example.com',
      });
    });

    it('should set tags when provided', () => {
      process.env.NEXT_PUBLIC_ENABLE_SENTRY = 'true';
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123';

      const error = new Error('Test error');
      captureException(error, {
        tags: { component: 'QuizForm', action: 'submit' },
      });

      expect(Sentry.setTags).toHaveBeenCalledWith({
        component: 'QuizForm',
        action: 'submit',
      });
    });

    it('should set component and action tags', () => {
      process.env.NEXT_PUBLIC_ENABLE_SENTRY = 'true';
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123';

      const error = new Error('Test error');
      captureException(error, {
        componentName: 'QuizForm',
        actionName: 'submit',
      });

      expect(Sentry.setTag).toHaveBeenCalledWith('component', 'QuizForm');
      expect(Sentry.setTag).toHaveBeenCalledWith('action', 'submit');
    });

    it('should set additional data context', () => {
      process.env.NEXT_PUBLIC_ENABLE_SENTRY = 'true';
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123';

      const error = new Error('Test error');
      captureException(error, {
        additionalData: { quizId: '123', score: 90 },
      });

      expect(Sentry.setContext).toHaveBeenCalledWith('additional_data', {
        quizId: '123',
        score: 90,
      });
    });

    it('should use custom severity level', () => {
      process.env.NEXT_PUBLIC_ENABLE_SENTRY = 'true';
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123';

      const error = new Error('Critical error');
      captureException(error, undefined, ErrorSeverity.FATAL);

      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        level: ErrorSeverity.FATAL,
      });
    });
  });

  describe('captureMessage', () => {
    it('should not call Sentry when disabled', () => {
      captureMessage('Test message');
      expect(Sentry.captureMessage).not.toHaveBeenCalled();
    });

    it('should call Sentry when enabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_SENTRY = 'true';
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123';

      captureMessage('Test message');

      expect(Sentry.captureMessage).toHaveBeenCalledWith(
        'Test message',
        ErrorSeverity.INFO
      );
    });

    it('should use custom severity level', () => {
      process.env.NEXT_PUBLIC_ENABLE_SENTRY = 'true';
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123';

      captureMessage('Warning message', undefined, ErrorSeverity.WARNING);

      expect(Sentry.captureMessage).toHaveBeenCalledWith(
        'Warning message',
        ErrorSeverity.WARNING
      );
    });
  });

  describe('setUserContext', () => {
    it('should not call Sentry when disabled', () => {
      setUserContext('user123', 'test@example.com');
      expect(Sentry.setUser).not.toHaveBeenCalled();
    });

    it('should call Sentry when enabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_SENTRY = 'true';
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123';

      setUserContext('user123', 'test@example.com', { role: 'student' });

      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: 'user123',
        email: 'test@example.com',
        role: 'student',
      });
    });
  });

  describe('clearUserContext', () => {
    it('should not call Sentry when disabled', () => {
      clearUserContext();
      expect(Sentry.setUser).not.toHaveBeenCalled();
    });

    it('should call Sentry with null when enabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_SENTRY = 'true';
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123';

      clearUserContext();

      expect(Sentry.setUser).toHaveBeenCalledWith(null);
    });
  });

  describe('addBreadcrumb', () => {
    it('should not call Sentry when disabled', () => {
      addBreadcrumb('User clicked button', 'user-action');
      expect(Sentry.addBreadcrumb).not.toHaveBeenCalled();
    });

    it('should call Sentry when enabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_SENTRY = 'true';
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123';

      addBreadcrumb('User clicked button', 'user-action', { buttonId: '123' });

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'User clicked button',
        category: 'user-action',
        data: { buttonId: '123' },
        level: ErrorSeverity.INFO,
      });
    });
  });

  describe('withErrorTracking', () => {
    it('should wrap function and capture errors', async () => {
      process.env.NEXT_PUBLIC_ENABLE_SENTRY = 'true';
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123';

      const error = new Error('Function failed');
      const failingFn = jest.fn().mockRejectedValue(error);

      const wrapped = withErrorTracking(failingFn, {
        componentName: 'TestComponent',
      });

      await expect(wrapped()).rejects.toThrow('Function failed');
      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        level: ErrorSeverity.ERROR,
      });
    });

    it('should pass through successful results', async () => {
      const successFn = jest.fn().mockResolvedValue('success');
      const wrapped = withErrorTracking(successFn);

      const result = await wrapped();
      expect(result).toBe('success');
      expect(Sentry.captureException).not.toHaveBeenCalled();
    });
  });

  describe('testErrorTracking', () => {
    it('should send test message in development', () => {
      const originalEnv = process.env.NODE_ENV;
      (process.env as { NODE_ENV: string }).NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_ENABLE_SENTRY = 'true';
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123';

      testErrorTracking();

      expect(Sentry.captureMessage).toHaveBeenCalledWith(
        'Test error tracking integration',
        ErrorSeverity.INFO
      );
      
      (process.env as { NODE_ENV: string }).NODE_ENV = originalEnv;
    });

    it('should not send test message in production', () => {
      const originalEnv = process.env.NODE_ENV;
      (process.env as { NODE_ENV: string }).NODE_ENV = 'production';

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      testErrorTracking();

      expect(Sentry.captureMessage).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      (process.env as { NODE_ENV: string }).NODE_ENV = originalEnv;
    });
  });
});
