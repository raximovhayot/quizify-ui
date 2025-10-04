/**
 * Security Event Logger
 *
 * Provides centralized security event logging for monitoring and audit purposes.
 * Integrates with New Relic (optional) for advanced monitoring and alerting.
 */

export enum SecurityEventType {
  // Authentication Events
  AUTH_SUCCESS = 'AUTH_SUCCESS',
  AUTH_FAILURE = 'AUTH_FAILURE',
  AUTH_LOGOUT = 'AUTH_LOGOUT',
  AUTH_SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',
  AUTH_TOKEN_REFRESH = 'AUTH_TOKEN_REFRESH',
  AUTH_TOKEN_REFRESH_FAILED = 'AUTH_TOKEN_REFRESH_FAILED',

  // Authorization Events
  AUTHZ_FAILURE = 'AUTHZ_FAILURE',
  AUTHZ_ROLE_MISMATCH = 'AUTHZ_ROLE_MISMATCH',

  // Security Events
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  XSS_ATTEMPT_BLOCKED = 'XSS_ATTEMPT_BLOCKED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_INPUT = 'INVALID_INPUT',

  // System Events
  ERROR_BOUNDARY_TRIGGERED = 'ERROR_BOUNDARY_TRIGGERED',
  API_ERROR = 'API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

export enum SecurityEventSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface SecurityEvent {
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  timestamp: string;
  userId?: string;
  phone?: string;
  userAgent?: string;
  ip?: string;
  url?: string;
  message?: string;
  details?: Record<string, unknown>;
  stackTrace?: string;
}

interface SecurityLoggerConfig {
  enableConsoleLogging?: boolean;
  enableNewRelic?: boolean;
  enableBackendLogging?: boolean;
  backendEndpoint?: string;
  maxQueueSize?: number;
}

class SecurityLogger {
  private events: SecurityEvent[] = [];
  private config: SecurityLoggerConfig;
  private eventQueue: SecurityEvent[] = [];
  private isProcessing = false;

  constructor(config: SecurityLoggerConfig = {}) {
    this.config = {
      enableConsoleLogging: process.env.NODE_ENV === 'development',
      enableNewRelic: process.env.NEXT_PUBLIC_ENABLE_NEW_RELIC === 'true',
      enableBackendLogging: true,
      backendEndpoint: '/api/security/events',
      maxQueueSize: 100,
      ...config,
    };
  }

  /**
   * Log a security event
   */
  log(
    type: SecurityEventType,
    severity: SecurityEventSeverity,
    message?: string,
    details?: Record<string, unknown>
  ): void {
    const event: SecurityEvent = {
      type,
      severity,
      timestamp: new Date().toISOString(),
      message,
      details,
      userAgent:
        typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    // Store in memory (limited by maxQueueSize)
    this.events.push(event);
    if (this.events.length > (this.config.maxQueueSize || 100)) {
      this.events.shift(); // Remove oldest event
    }

    // Add to processing queue
    this.eventQueue.push(event);

    // Console logging for development
    if (this.config.enableConsoleLogging) {
      this.logToConsole(event);
    }

    // Send to New Relic if enabled
    if (this.config.enableNewRelic) {
      this.logToNewRelic(event);
    }

    // Send to backend for persistence
    if (this.config.enableBackendLogging) {
      this.queueBackendLog(event);
    }

    // Alert on critical events
    if (severity === SecurityEventSeverity.CRITICAL) {
      this.alertCriticalEvent(event);
    }
  }

  /**
   * Log to console with formatting
   */
  private logToConsole(event: SecurityEvent): void {
    const color = this.getSeverityColor(event.severity);
    const prefix = `[SECURITY:${event.severity.toUpperCase()}]`;

    console.log(
      `%c${prefix} ${event.type}`,
      `color: ${color}; font-weight: bold;`,
      {
        message: event.message,
        details: event.details,
        timestamp: event.timestamp,
      }
    );
  }

  /**
   * Log to New Relic
   */
  private logToNewRelic(event: SecurityEvent): void {
    if (typeof window === 'undefined') return;

    try {
      // Check if New Relic is available
      const newrelic = (window as any).newrelic;
      if (!newrelic) return;

      // Log as custom event
      newrelic.addPageAction('SecurityEvent', {
        eventType: event.type,
        severity: event.severity,
        message: event.message,
        userId: event.userId,
        timestamp: event.timestamp,
        ...event.details,
      });

      // For errors, also use noticeError
      if (
        event.severity === SecurityEventSeverity.HIGH ||
        event.severity === SecurityEventSeverity.CRITICAL
      ) {
        const error = new Error(
          `Security Event: ${event.type} - ${event.message || ''}`
        );
        newrelic.noticeError(error, {
          eventType: event.type,
          severity: event.severity,
          ...event.details,
        });
      }
    } catch (error) {
      console.error('[SECURITY LOGGER] Failed to log to New Relic:', error);
    }
  }

  /**
   * Queue event for backend logging
   */
  private queueBackendLog(event: SecurityEvent): void {
    if (this.isProcessing) return;

    // Process queue in batches
    setTimeout(() => this.processQueue(), 1000);
  }

  /**
   * Process queued events and send to backend
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) return;

    this.isProcessing = true;
    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // TODO: Implement backend endpoint
      // For now, we'll just log that we would send these events
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[SECURITY LOGGER] Would send ${eventsToSend.length} events to backend`
        );
      }

      // Uncomment when backend endpoint is ready:
      /*
      const response = await fetch(this.config.backendEndpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events: eventsToSend }),
      });

      if (!response.ok) {
        throw new Error(`Backend logging failed: ${response.statusText}`);
      }
      */
    } catch (error) {
      console.error('[SECURITY LOGGER] Failed to send events to backend:', error);
      // Re-queue failed events
      this.eventQueue.unshift(...eventsToSend);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Alert on critical security events
   */
  private alertCriticalEvent(event: SecurityEvent): void {
    console.error('[SECURITY ALERT] Critical security event detected:', event);

    // In production, this could trigger:
    // - Email notifications
    // - Slack/Teams alerts
    // - PagerDuty incidents
    // - SMS alerts for on-call team
  }

  /**
   * Get color for severity level
   */
  private getSeverityColor(severity: SecurityEventSeverity): string {
    switch (severity) {
      case SecurityEventSeverity.LOW:
        return '#3b82f6'; // blue
      case SecurityEventSeverity.MEDIUM:
        return '#f59e0b'; // orange
      case SecurityEventSeverity.HIGH:
        return '#ef4444'; // red
      case SecurityEventSeverity.CRITICAL:
        return '#dc2626'; // dark red
      default:
        return '#6b7280'; // gray
    }
  }

  /**
   * Get recent security events
   */
  getRecentEvents(limit = 100): SecurityEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * Get events by type
   */
  getEventsByType(type: SecurityEventType): SecurityEvent[] {
    return this.events.filter((event) => event.type === type);
  }

  /**
   * Get events by severity
   */
  getEventsBySeverity(severity: SecurityEventSeverity): SecurityEvent[] {
    return this.events.filter((event) => event.severity === severity);
  }

  /**
   * Clear events (for cleanup)
   */
  clear(): void {
    this.events = [];
    this.eventQueue = [];
  }

  /**
   * Get statistics
   */
  getStats(): {
    total: number;
    bySeverity: Record<SecurityEventSeverity, number>;
    byType: Record<string, number>;
  } {
    const stats = {
      total: this.events.length,
      bySeverity: {
        [SecurityEventSeverity.LOW]: 0,
        [SecurityEventSeverity.MEDIUM]: 0,
        [SecurityEventSeverity.HIGH]: 0,
        [SecurityEventSeverity.CRITICAL]: 0,
      },
      byType: {} as Record<string, number>,
    };

    this.events.forEach((event) => {
      stats.bySeverity[event.severity]++;
      stats.byType[event.type] = (stats.byType[event.type] || 0) + 1;
    });

    return stats;
  }
}

// Singleton instance
export const securityLogger = new SecurityLogger();

// =============================================================================
// HELPER FUNCTIONS FOR COMMON SECURITY EVENTS
// =============================================================================

/**
 * Log successful authentication
 */
export const logAuthSuccess = (userId: string, phone: string): void => {
  securityLogger.log(
    SecurityEventType.AUTH_SUCCESS,
    SecurityEventSeverity.LOW,
    'User authenticated successfully',
    { userId, phone }
  );
};

/**
 * Log failed authentication
 */
export const logAuthFailure = (phone: string, reason: string): void => {
  securityLogger.log(
    SecurityEventType.AUTH_FAILURE,
    SecurityEventSeverity.MEDIUM,
    'Authentication failed',
    { phone, reason }
  );
};

/**
 * Log user logout
 */
export const logLogout = (userId: string): void => {
  securityLogger.log(
    SecurityEventType.AUTH_LOGOUT,
    SecurityEventSeverity.LOW,
    'User logged out',
    { userId }
  );
};

/**
 * Log session expiration
 */
export const logSessionExpired = (userId?: string): void => {
  securityLogger.log(
    SecurityEventType.AUTH_SESSION_EXPIRED,
    SecurityEventSeverity.LOW,
    'Session expired',
    { userId }
  );
};

/**
 * Log token refresh
 */
export const logTokenRefresh = (userId: string, success: boolean): void => {
  securityLogger.log(
    success
      ? SecurityEventType.AUTH_TOKEN_REFRESH
      : SecurityEventType.AUTH_TOKEN_REFRESH_FAILED,
    success ? SecurityEventSeverity.LOW : SecurityEventSeverity.MEDIUM,
    success ? 'Token refreshed successfully' : 'Token refresh failed',
    { userId }
  );
};

/**
 * Log authorization failure
 */
export const logAuthzFailure = (
  userId: string,
  resource: string,
  action: string,
  requiredRole?: string
): void => {
  securityLogger.log(
    SecurityEventType.AUTHZ_FAILURE,
    SecurityEventSeverity.HIGH,
    'Authorization failed',
    { userId, resource, action, requiredRole }
  );
};

/**
 * Log role mismatch
 */
export const logRoleMismatch = (
  userId: string,
  userRoles: string[],
  requiredRoles: string[]
): void => {
  securityLogger.log(
    SecurityEventType.AUTHZ_ROLE_MISMATCH,
    SecurityEventSeverity.HIGH,
    'User role does not match required roles',
    { userId, userRoles, requiredRoles }
  );
};

/**
 * Log suspicious activity
 */
export const logSuspiciousActivity = (
  activity: string,
  userId?: string,
  details?: Record<string, unknown>
): void => {
  securityLogger.log(
    SecurityEventType.SUSPICIOUS_ACTIVITY,
    SecurityEventSeverity.CRITICAL,
    activity,
    { userId, ...details }
  );
};

/**
 * Log XSS attempt (when sanitization removes dangerous content)
 */
export const logXssAttempt = (
  originalContent: string,
  sanitizedContent: string,
  userId?: string
): void => {
  if (originalContent !== sanitizedContent) {
    securityLogger.log(
      SecurityEventType.XSS_ATTEMPT_BLOCKED,
      SecurityEventSeverity.HIGH,
      'Potential XSS attempt blocked by sanitization',
      {
        userId,
        originalLength: originalContent.length,
        sanitizedLength: sanitizedContent.length,
        removed: originalContent.length - sanitizedContent.length,
      }
    );
  }
};

/**
 * Log rate limit exceeded
 */
export const logRateLimitExceeded = (
  endpoint: string,
  identifier: string
): void => {
  securityLogger.log(
    SecurityEventType.RATE_LIMIT_EXCEEDED,
    SecurityEventSeverity.HIGH,
    'Rate limit exceeded',
    { endpoint, identifier }
  );
};

/**
 * Log invalid input
 */
export const logInvalidInput = (
  field: string,
  value: unknown,
  error: string
): void => {
  securityLogger.log(
    SecurityEventType.INVALID_INPUT,
    SecurityEventSeverity.LOW,
    'Invalid input detected',
    { field, error, valueType: typeof value }
  );
};

/**
 * Log error boundary trigger
 */
export const logErrorBoundary = (
  error: Error,
  errorInfo?: { componentStack?: string }
): void => {
  securityLogger.log(
    SecurityEventType.ERROR_BOUNDARY_TRIGGERED,
    SecurityEventSeverity.HIGH,
    `Error boundary caught: ${error.message}`,
    {
      errorName: error.name,
      errorMessage: error.message,
      stackTrace: error.stack,
      componentStack: errorInfo?.componentStack,
    }
  );
};

/**
 * Log API error
 */
export const logApiError = (
  endpoint: string,
  status: number,
  error: string,
  userId?: string
): void => {
  const severity =
    status >= 500
      ? SecurityEventSeverity.HIGH
      : status === 401 || status === 403
        ? SecurityEventSeverity.MEDIUM
        : SecurityEventSeverity.LOW;

  securityLogger.log(
    SecurityEventType.API_ERROR,
    severity,
    `API error: ${status} ${error}`,
    { endpoint, status, error, userId }
  );
};

/**
 * Log network error
 */
export const logNetworkError = (endpoint: string, error: string): void => {
  securityLogger.log(
    SecurityEventType.NETWORK_ERROR,
    SecurityEventSeverity.MEDIUM,
    'Network error occurred',
    { endpoint, error }
  );
};
