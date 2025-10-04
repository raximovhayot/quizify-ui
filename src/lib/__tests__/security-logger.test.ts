/**
 * Tests for security logger
 */

import {
  logApiError,
  logAuthFailure,
  logAuthSuccess,
  logAuthzFailure,
  logErrorBoundary,
  logInvalidInput,
  logLogout,
  logNetworkError,
  logRateLimitExceeded,
  logRoleMismatch,
  logSessionExpired,
  logSuspiciousActivity,
  logTokenRefresh,
  logXssAttempt,
  securityLogger,
  SecurityEventSeverity,
  SecurityEventType,
} from '../security-logger';

describe('SecurityLogger', () => {
  beforeEach(() => {
    // Clear events before each test
    securityLogger.clear();
  });

  describe('Basic Logging', () => {
    it('should log security events', () => {
      securityLogger.log(
        SecurityEventType.AUTH_SUCCESS,
        SecurityEventSeverity.LOW,
        'Test event'
      );

      const events = securityLogger.getRecentEvents();
      expect(events).toHaveLength(1);
      expect(events[0]?.type).toBe(SecurityEventType.AUTH_SUCCESS);
      expect(events[0]?.severity).toBe(SecurityEventSeverity.LOW);
    });

    it('should include timestamp in events', () => {
      securityLogger.log(
        SecurityEventType.AUTH_SUCCESS,
        SecurityEventSeverity.LOW
      );

      const events = securityLogger.getRecentEvents();
      expect(events[0]?.timestamp).toBeDefined();
      expect(new Date(events[0]!.timestamp).getTime()).toBeLessThanOrEqual(
        Date.now()
      );
    });

    it('should limit events to maxQueueSize', () => {
      // Log more than maxQueueSize (default 100)
      for (let i = 0; i < 150; i++) {
        securityLogger.log(
          SecurityEventType.AUTH_SUCCESS,
          SecurityEventSeverity.LOW
        );
      }

      const events = securityLogger.getRecentEvents();
      expect(events.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Authentication Logging', () => {
    it('should log successful authentication', () => {
      logAuthSuccess('user123', '+998901234567');

      const events = securityLogger.getEventsByType(
        SecurityEventType.AUTH_SUCCESS
      );
      expect(events).toHaveLength(1);
      expect(events[0]?.details?.userId).toBe('user123');
      expect(events[0]?.details?.phone).toBe('+998901234567');
    });

    it('should log failed authentication', () => {
      logAuthFailure('+998901234567', 'Invalid password');

      const events = securityLogger.getEventsByType(
        SecurityEventType.AUTH_FAILURE
      );
      expect(events).toHaveLength(1);
      expect(events[0]?.severity).toBe(SecurityEventSeverity.MEDIUM);
      expect(events[0]?.details?.phone).toBe('+998901234567');
      expect(events[0]?.details?.reason).toBe('Invalid password');
    });

    it('should log user logout', () => {
      logLogout('user123');

      const events = securityLogger.getEventsByType(SecurityEventType.AUTH_LOGOUT);
      expect(events).toHaveLength(1);
      expect(events[0]?.details?.userId).toBe('user123');
    });

    it('should log session expiration', () => {
      logSessionExpired('user123');

      const events = securityLogger.getEventsByType(
        SecurityEventType.AUTH_SESSION_EXPIRED
      );
      expect(events).toHaveLength(1);
    });

    it('should log token refresh success', () => {
      logTokenRefresh('user123', true);

      const events = securityLogger.getEventsByType(
        SecurityEventType.AUTH_TOKEN_REFRESH
      );
      expect(events).toHaveLength(1);
      expect(events[0]?.severity).toBe(SecurityEventSeverity.LOW);
    });

    it('should log token refresh failure', () => {
      logTokenRefresh('user123', false);

      const events = securityLogger.getEventsByType(
        SecurityEventType.AUTH_TOKEN_REFRESH_FAILED
      );
      expect(events).toHaveLength(1);
      expect(events[0]?.severity).toBe(SecurityEventSeverity.MEDIUM);
    });
  });

  describe('Authorization Logging', () => {
    it('should log authorization failure', () => {
      logAuthzFailure('user123', '/admin', 'READ', 'ADMIN');

      const events = securityLogger.getEventsByType(
        SecurityEventType.AUTHZ_FAILURE
      );
      expect(events).toHaveLength(1);
      expect(events[0]?.severity).toBe(SecurityEventSeverity.HIGH);
      expect(events[0]?.details?.resource).toBe('/admin');
    });

    it('should log role mismatch', () => {
      logRoleMismatch('user123', ['STUDENT'], ['INSTRUCTOR']);

      const events = securityLogger.getEventsByType(
        SecurityEventType.AUTHZ_ROLE_MISMATCH
      );
      expect(events).toHaveLength(1);
      expect(events[0]?.severity).toBe(SecurityEventSeverity.HIGH);
      expect(events[0]?.details?.userRoles).toEqual(['STUDENT']);
      expect(events[0]?.details?.requiredRoles).toEqual(['INSTRUCTOR']);
    });
  });

  describe('Security Event Logging', () => {
    it('should log suspicious activity', () => {
      logSuspiciousActivity('Multiple failed login attempts', 'user123');

      const events = securityLogger.getEventsByType(
        SecurityEventType.SUSPICIOUS_ACTIVITY
      );
      expect(events).toHaveLength(1);
      expect(events[0]?.severity).toBe(SecurityEventSeverity.CRITICAL);
    });

    it('should log XSS attempt when content is sanitized', () => {
      const original = '<p>Hello</p><script>alert("XSS")</script>';
      const sanitized = '<p>Hello</p>';

      logXssAttempt(original, sanitized, 'user123');

      const events = securityLogger.getEventsByType(
        SecurityEventType.XSS_ATTEMPT_BLOCKED
      );
      expect(events).toHaveLength(1);
      expect(events[0]?.severity).toBe(SecurityEventSeverity.HIGH);
      expect(events[0]?.details?.removed).toBeGreaterThan(0);
    });

    it('should not log XSS attempt when content is unchanged', () => {
      const content = '<p>Hello</p>';
      logXssAttempt(content, content);

      const events = securityLogger.getEventsByType(
        SecurityEventType.XSS_ATTEMPT_BLOCKED
      );
      expect(events).toHaveLength(0);
    });

    it('should log rate limit exceeded', () => {
      logRateLimitExceeded('/api/auth/login', 'user123');

      const events = securityLogger.getEventsByType(
        SecurityEventType.RATE_LIMIT_EXCEEDED
      );
      expect(events).toHaveLength(1);
      expect(events[0]?.severity).toBe(SecurityEventSeverity.HIGH);
    });

    it('should log invalid input', () => {
      logInvalidInput('email', 'not-an-email', 'Invalid email format');

      const events = securityLogger.getEventsByType(
        SecurityEventType.INVALID_INPUT
      );
      expect(events).toHaveLength(1);
      expect(events[0]?.severity).toBe(SecurityEventSeverity.LOW);
    });
  });

  describe('System Event Logging', () => {
    it('should log error boundary events', () => {
      const error = new Error('Test error');
      const errorInfo = { componentStack: 'Component stack trace' };

      logErrorBoundary(error, errorInfo);

      const events = securityLogger.getEventsByType(
        SecurityEventType.ERROR_BOUNDARY_TRIGGERED
      );
      expect(events).toHaveLength(1);
      expect(events[0]?.severity).toBe(SecurityEventSeverity.HIGH);
      expect(events[0]?.details?.errorMessage).toBe('Test error');
    });

    it('should log API errors', () => {
      logApiError('/api/users', 500, 'Internal server error', 'user123');

      const events = securityLogger.getEventsByType(SecurityEventType.API_ERROR);
      expect(events).toHaveLength(1);
      expect(events[0]?.severity).toBe(SecurityEventSeverity.HIGH);
      expect(events[0]?.details?.status).toBe(500);
    });

    it('should log API errors with appropriate severity', () => {
      // 5xx errors should be HIGH
      logApiError('/api/users', 500, 'Server error');
      let events = securityLogger.getEventsByType(SecurityEventType.API_ERROR);
      expect(events[events.length - 1]?.severity).toBe(SecurityEventSeverity.HIGH);

      // 401/403 errors should be MEDIUM
      logApiError('/api/admin', 401, 'Unauthorized');
      events = securityLogger.getEventsByType(SecurityEventType.API_ERROR);
      expect(events[events.length - 1]?.severity).toBe(
        SecurityEventSeverity.MEDIUM
      );

      // Other errors should be LOW
      logApiError('/api/users', 404, 'Not found');
      events = securityLogger.getEventsByType(SecurityEventType.API_ERROR);
      expect(events[events.length - 1]?.severity).toBe(SecurityEventSeverity.LOW);
    });

    it('should log network errors', () => {
      logNetworkError('/api/users', 'Network connection failed');

      const events = securityLogger.getEventsByType(
        SecurityEventType.NETWORK_ERROR
      );
      expect(events).toHaveLength(1);
      expect(events[0]?.severity).toBe(SecurityEventSeverity.MEDIUM);
    });
  });

  describe('Event Filtering', () => {
    beforeEach(() => {
      // Log various events
      logAuthSuccess('user1', '+1234567890');
      logAuthFailure('+9876543210', 'Invalid password');
      logSuspiciousActivity('Test activity');
      logApiError('/api/test', 500, 'Error');
    });

    it('should filter events by type', () => {
      const authEvents = securityLogger.getEventsByType(
        SecurityEventType.AUTH_SUCCESS
      );
      expect(authEvents).toHaveLength(1);
      expect(authEvents[0]?.type).toBe(SecurityEventType.AUTH_SUCCESS);
    });

    it('should filter events by severity', () => {
      const criticalEvents = securityLogger.getEventsBySeverity(
        SecurityEventSeverity.CRITICAL
      );
      expect(criticalEvents).toHaveLength(1);
      expect(criticalEvents[0]?.type).toBe(
        SecurityEventType.SUSPICIOUS_ACTIVITY
      );
    });

    it('should get recent events with limit', () => {
      const recentEvents = securityLogger.getRecentEvents(2);
      expect(recentEvents).toHaveLength(2);
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      logAuthSuccess('user1', '+1234567890');
      logAuthFailure('+9876543210', 'Invalid password');
      logAuthFailure('+1111111111', 'Invalid password');
      logSuspiciousActivity('Test activity');
    });

    it('should provide statistics', () => {
      const stats = securityLogger.getStats();

      expect(stats.total).toBe(4);
      expect(stats.bySeverity[SecurityEventSeverity.LOW]).toBe(1);
      expect(stats.bySeverity[SecurityEventSeverity.MEDIUM]).toBe(2);
      expect(stats.bySeverity[SecurityEventSeverity.CRITICAL]).toBe(1);
    });

    it('should count events by type', () => {
      const stats = securityLogger.getStats();

      expect(stats.byType[SecurityEventType.AUTH_SUCCESS]).toBe(1);
      expect(stats.byType[SecurityEventType.AUTH_FAILURE]).toBe(2);
      expect(stats.byType[SecurityEventType.SUSPICIOUS_ACTIVITY]).toBe(1);
    });
  });

  describe('Clear Events', () => {
    it('should clear all events', () => {
      logAuthSuccess('user1', '+1234567890');
      logAuthFailure('+9876543210', 'Invalid password');

      expect(securityLogger.getRecentEvents()).toHaveLength(2);

      securityLogger.clear();

      expect(securityLogger.getRecentEvents()).toHaveLength(0);
    });
  });
});
