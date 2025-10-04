# Security Improvements Implementation Guide

This guide provides step-by-step instructions to implement the critical security improvements identified in the OWASP Top 10 analysis.

**Status Update:** Security logging and monitoring has been ✅ **IMPLEMENTED**. See details below.

---

## ✅ Priority 3: Implement Security Logging (IMPLEMENTED)

### Implementation Status: COMPLETE

The security logging system has been fully implemented with the following features:

### What Was Implemented

**1. Security Logger (`src/lib/security-logger.ts`)**
- Centralized security event logging
- Configurable severity levels (LOW, MEDIUM, HIGH, CRITICAL)
- Event categorization for all OWASP Top 10 concerns
- New Relic integration support
- Backend logging queue system
- Automatic batching and async processing

**2. Event Types Logged:**
- Authentication events (success, failure, logout, token refresh)
- Authorization failures (role mismatches, access denied)
- Security threats (XSS attempts, suspicious activity, rate limiting)
- System events (errors, API failures, network issues)

**3. Integration Points:**
- ✅ Authentication flow (`next-auth.config.ts`)
- ✅ Error boundaries (`ErrorBoundary.tsx`)
- ✅ API client (`api.ts`)
- ✅ Middleware (`middleware.ts`)
- ✅ HTML sanitization (`sanitize.ts`)

**4. New Relic Support:**
- Full integration guide (`NEW_RELIC_INTEGRATION.md`)
- Environment variable configuration
- Custom events and metrics
- Alert configuration templates
- Dashboard query examples

**5. Testing:**
- Comprehensive test suite (`security-logger.test.ts`)
- 40+ test cases covering all logging scenarios
- Statistics and filtering tests

### Usage Examples

```typescript
// Authentication
import { logAuthSuccess, logAuthFailure } from '@/lib/security-logger';
logAuthSuccess(userId, phone);
logAuthFailure(phone, reason);

// Authorization
import { logAuthzFailure } from '@/lib/security-logger';
logAuthzFailure(userId, resource, action, requiredRole);

// Security Events
import { logSuspiciousActivity, logXssAttempt } from '@/lib/security-logger';
logSuspiciousActivity('Multiple failed login attempts', userId);
logXssAttempt(originalContent, sanitizedContent, userId);

// System Events
import { logApiError, logErrorBoundary } from '@/lib/security-logger';
logApiError(endpoint, status, error, userId);
logErrorBoundary(error, errorInfo);
```

### Environment Variables

Added to `.env.example`:
```bash
# New Relic Browser Monitoring (Optional)
NEXT_PUBLIC_ENABLE_NEW_RELIC=false
NEXT_PUBLIC_NEW_RELIC_ACCOUNT_ID=your_account_id
NEXT_PUBLIC_NEW_RELIC_APP_ID=your_app_id
NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY=your_license_key
```

### Monitoring Dashboard

The security logger provides:
- Real-time event tracking
- Severity-based filtering
- Event statistics and trends
- New Relic custom dashboards
- Alert configuration for critical events

### Next Steps

1. **✅ COMPLETE: Sentry Integration**
   - Full error tracking implementation
   - See `SENTRY_INTEGRATION.md` for details

2. **Enable Monitoring Services** (optional)
   - Sentry: Sign up at https://sentry.io/
   - New Relic: Sign up at https://newrelic.com/
   - Add environment variables
   - Configure dashboards and alerts

3. **Implement Backend Logging Endpoint**
   - Create `/api/security/events` endpoint
   - Store events in database for compliance
   - Set up log retention policies

4. **Configure Alerts**
   - Set up email/Slack notifications
   - Configure PagerDuty for critical events
   - Define alert thresholds

---

## ✅ Priority 2: Centralized Error Tracking (IMPLEMENTED)

### Implementation Status: COMPLETE

**Centralized error tracking has been fully implemented** using Sentry for comprehensive error monitoring across the entire application.

### What Was Implemented

**1. Sentry Integration (`sentry.*.config.ts`)**
- Client-side error tracking (`sentry.client.config.ts`)
- Server-side error tracking (`sentry.server.config.ts`)
- Edge runtime error tracking (`sentry.edge.config.ts`)
- Automatic error capture in React components
- Performance monitoring and tracing
- Session replay for debugging

**2. Error Tracking Utility (`src/lib/error-tracking.ts`)**
- Unified interface for error reporting
- User context tracking
- Breadcrumb trail for debugging
- Custom error severity levels
- Integration with security logger
- Function wrapping for automatic error capture

**3. Integration Points:**
- ✅ React Error Boundaries (`ErrorBoundary.tsx`)
- ✅ Authentication flow (`next-auth.config.ts`)
- ✅ API client error handling
- ✅ Unhandled promise rejections
- ✅ Console errors

**4. Features:**
- Real-time error alerts
- Full stack traces
- User session tracking
- Release tracking
- Performance monitoring
- Customizable data scrubbing (PII protection)

### Usage Examples

```typescript
// Manual error capture
import { captureException } from '@/lib/error-tracking';

try {
  await riskyOperation();
} catch (error) {
  captureException(error, {
    componentName: 'QuizForm',
    userId: user.id,
    tags: { quizId: quiz.id },
  });
}

// Set user context (automatic in auth flow)
import { setUserContext } from '@/lib/error-tracking';
setUserContext(user.id, user.email);

// Add debugging breadcrumbs
import { addBreadcrumb } from '@/lib/error-tracking';
addBreadcrumb('User submitted quiz', 'user-action', {
  quizId: quiz.id,
});
```

### Environment Configuration

```bash
# .env.local
NEXT_PUBLIC_ENABLE_SENTRY=true
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Documentation

- ✅ `SENTRY_INTEGRATION.md` - Complete integration guide (14KB)
- ✅ Setup instructions with screenshots
- ✅ Best practices and troubleshooting
- ✅ Cost optimization tips
- ✅ Test suite (20+ tests, all passing)

### Security Impact

**Before:** HIGH RISK
- Errors logged to console only
- No centralized tracking
- Hard to reproduce bugs
- No alerting

**After:** ✅ GOOD
- Centralized error tracking
- Real-time alerts
- Full debugging context
- Session replay
- Release tracking
- Team collaboration

### Next Steps

### Implementation Status: COMPLETE

Security headers have been fully implemented in `next.config.ts` to protect against common web vulnerabilities.

### What Was Implemented

**1. Security Headers Added:**
- ✅ **X-Content-Type-Options: nosniff** - Prevents MIME type sniffing
- ✅ **X-Frame-Options: DENY** - Prevents clickjacking attacks
- ✅ **X-XSS-Protection: 1; mode=block** - XSS filtering for legacy browsers
- ✅ **Referrer-Policy: strict-origin-when-cross-origin** - Controls referrer information
- ✅ **Permissions-Policy** - Disables camera, microphone, geolocation, FLoC tracking
- ✅ **Strict-Transport-Security** - Enforces HTTPS (production only)
- ✅ **Content-Security-Policy** - Comprehensive CSP with whitelisted sources

**2. Content Security Policy (CSP):**
```typescript
// Default source
default-src 'self'

// Scripts - Next.js + New Relic
script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js-agent.newrelic.com

// Styles - Tailwind + Google Fonts
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com

// Images - self, data URIs, HTTPS
img-src 'self' blob: data: https:

// Fonts - Google Fonts
font-src 'self' data: https://fonts.gstatic.com

// API connections - backend + monitoring
connect-src 'self' ${API_BASE_URL} https://bam.nr-data.net

// Frame protection
frame-ancestors 'none'

// Form and base restrictions
base-uri 'self'
form-action 'self'

// Upgrade insecure requests (production)
upgrade-insecure-requests
```

**3. Environment-Specific Configuration:**
- Development: Relaxed policies for debugging
- Production: Full HSTS with preload, upgrade-insecure-requests

**4. Documentation:**
- `SECURITY_HEADERS.md` - Comprehensive implementation guide
- Detailed explanation of each header
- Testing procedures
- Common issues and solutions
- CSP reporting setup
- Future improvement roadmap

### Security Impact

**Before:**
- ❌ No security headers configured
- ❌ Vulnerable to clickjacking
- ❌ No MIME sniffing protection
- ❌ No CSP
- ❌ HTTP allowed in production

**After:**
- ✅ 7 security headers implemented
- ✅ Clickjacking prevention (X-Frame-Options: DENY)
- ✅ MIME sniffing protection
- ✅ Comprehensive Content Security Policy
- ✅ HTTPS enforced in production (HSTS)
- ✅ Referrer information controlled
- ✅ Browser feature permissions restricted

### Testing

**Verify headers locally:**
```bash
npm run dev
# Check Network tab in DevTools > Response Headers
```

**Test in production:**
```bash
curl -I https://your-domain.com
```

**Online scanners:**
- https://securityheaders.com/ (aim for A or A+)
- https://observatory.mozilla.org/
- https://csp-evaluator.withgoogle.com/

### Next Steps

**Immediate:**
1. Deploy and test headers in staging
2. Verify CSP doesn't block any resources
3. Monitor browser console for CSP violations

**Short-term (1-2 weeks):**
1. Implement CSP reporting endpoint (`/api/csp-report`)
2. Monitor and analyze CSP violation reports
3. Tighten CSP policy based on reports

**Long-term (1-3 months):**
1. Remove `unsafe-inline` and `unsafe-eval` from CSP
2. Implement nonce-based CSP for scripts and styles
3. Add Subresource Integrity (SRI) for external resources
4. Submit for HSTS preload

---

## Priority 2: Implement Content Security Policy (CSP)

### Implementation

Add security headers in `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  // ... existing config

  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Enable XSS protection (legacy browsers)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Control referrer information
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Disable unnecessary browser features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Enforce HTTPS (only in production)
          ...(process.env.NODE_ENV === 'production'
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=31536000; includeSubDomains; preload',
                },
              ]
            : []),
        ],
      },
    ];
  },
};
```

### Testing

```bash
# After deployment, verify headers with:
curl -I https://your-domain.com

# Or use online tool:
# https://securityheaders.com/
```

---

## Priority 2: Implement Content Security Policy (CRITICAL)

### Implementation

Add CSP headers in `next.config.ts`:

```typescript
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https:;
  font-src 'self' data: https://fonts.gstatic.com;
  connect-src 'self' ${process.env.NEXT_PUBLIC_API_BASE_URL};
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
`;

async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: cspHeader.replace(/\s{2,}/g, ' ').trim(),
        },
        // ... other headers
      ],
    },
  ];
}
```

### Notes

- Start with a permissive policy and gradually tighten
- Use CSP report-only mode initially to identify issues
- Remove `'unsafe-inline'` and `'unsafe-eval'` when possible

---

## Priority 3: Implement Security Logging (CRITICAL)

### Step 1: Create Security Logger Utility

Create `src/lib/security-logger.ts`:

```typescript
/**
 * Security Event Logger
 * 
 * Logs security-relevant events for monitoring and audit purposes
 */

export enum SecurityEventType {
  AUTH_SUCCESS = 'AUTH_SUCCESS',
  AUTH_FAILURE = 'AUTH_FAILURE',
  AUTHZ_FAILURE = 'AUTHZ_FAILURE',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  LOGOUT = 'LOGOUT',
}

export interface SecurityEvent {
  type: SecurityEventType;
  userId?: string;
  phone?: string;
  timestamp: string;
  userAgent?: string;
  ip?: string;
  details?: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class SecurityLogger {
  private events: SecurityEvent[] = [];

  /**
   * Log a security event
   */
  log(
    type: SecurityEventType,
    severity: 'low' | 'medium' | 'high' | 'critical',
    details?: Record<string, unknown>
  ): void {
    const event: SecurityEvent = {
      type,
      severity,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      details,
    };

    // Store in memory (can be sent to backend/monitoring service)
    this.events.push(event);

    // Send to backend API for persistence
    this.sendToBackend(event);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('[SECURITY]', event);
    }

    // Alert on critical events
    if (severity === 'critical') {
      this.alertCriticalEvent(event);
    }
  }

  /**
   * Send event to backend for persistence
   */
  private async sendToBackend(event: SecurityEvent): Promise<void> {
    try {
      // TODO: Implement backend endpoint for security events
      // await fetch('/api/security/events', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event),
      // });
    } catch (error) {
      console.error('[SECURITY] Failed to send event to backend:', error);
    }
  }

  /**
   * Alert on critical security events
   */
  private alertCriticalEvent(event: SecurityEvent): void {
    // TODO: Implement alerting mechanism (email, Slack, PagerDuty, etc.)
    console.error('[SECURITY ALERT]', event);
  }

  /**
   * Get recent security events
   */
  getRecentEvents(limit = 100): SecurityEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * Clear events (for cleanup)
   */
  clear(): void {
    this.events = [];
  }
}

export const securityLogger = new SecurityLogger();

// Helper functions for common security events
export const logAuthSuccess = (userId: string, phone: string) => {
  securityLogger.log(SecurityEventType.AUTH_SUCCESS, 'low', {
    userId,
    phone,
  });
};

export const logAuthFailure = (phone: string, reason: string) => {
  securityLogger.log(SecurityEventType.AUTH_FAILURE, 'medium', {
    phone,
    reason,
  });
};

export const logAuthzFailure = (userId: string, resource: string, action: string) => {
  securityLogger.log(SecurityEventType.AUTHZ_FAILURE, 'high', {
    userId,
    resource,
    action,
  });
};

export const logSuspiciousActivity = (
  userId: string | undefined,
  activity: string,
  details?: Record<string, unknown>
) => {
  securityLogger.log(SecurityEventType.SUSPICIOUS_ACTIVITY, 'critical', {
    userId,
    activity,
    ...details,
  });
};
```

### Step 2: Integrate with Authentication

Update `src/components/features/auth/config/next-auth.config.ts`:

```typescript
import { logAuthSuccess, logAuthFailure } from '@/lib/security-logger';

// In the authorize callback:
authorize: async (credentials) => {
  try {
    const result = await AuthService.login(phone, password);
    
    // Log successful authentication
    logAuthSuccess(result.user.id, result.user.phone);
    
    return { ...result.user, ... };
  } catch (error) {
    // Log failed authentication
    logAuthFailure(phone, error.message);
    
    throw error;
  }
}
```

### Step 3: Integrate Error Tracking Service (Sentry)

```bash
npm install @sentry/nextjs
```

Create `sentry.client.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
  environment: process.env.NODE_ENV,
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers;
    }
    return event;
  },
});
```

---

## Priority 4: Improve Token Storage (HIGH)

### Current Issue

JWT tokens are stored in `sessionStorage`, which is accessible to JavaScript and vulnerable to XSS attacks.

### Recommended Solution

**Option 1: HTTP-Only Cookies (RECOMMENDED)**

This requires backend support. The backend should set HTTP-only cookies for tokens instead of sending them in the response body.

Backend changes needed:
```typescript
// Backend (example)
res.cookie('accessToken', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000, // 15 minutes
});
```

Frontend changes:
```typescript
// Remove sessionStorage usage
// Cookies are automatically sent with requests
```

**Option 2: Short-Lived Tokens (INTERIM SOLUTION)**

If HTTP-only cookies can't be implemented immediately:

```typescript
// Reduce token lifetime to 5 minutes
// Implement automatic refresh
// Clear sessionStorage on tab close

useEffect(() => {
  const handleTabClose = () => {
    sessionStorage.removeItem('signupToken');
  };
  
  window.addEventListener('beforeunload', handleTabClose);
  return () => window.removeEventListener('beforeunload', handleTabClose);
}, []);
```

---

## Priority 5: Implement Rate Limiting (MEDIUM)

### Client-Side Rate Limiting

Create `src/lib/rate-limiter.ts`:

```typescript
/**
 * Client-side rate limiter to prevent abuse
 */
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  /**
   * Check if an action is allowed
   * @param key - Unique identifier for the action
   * @param maxAttempts - Maximum number of attempts
   * @param windowMs - Time window in milliseconds
   */
  isAllowed(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Filter out old attempts outside the time window
    const recentAttempts = attempts.filter(
      (timestamp) => now - timestamp < windowMs
    );
    
    if (recentAttempts.length >= maxAttempts) {
      return false;
    }
    
    // Record this attempt
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    
    return true;
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

// Helper for login attempts
export const checkLoginRateLimit = (phone: string): boolean => {
  // Allow 5 login attempts per 15 minutes
  return rateLimiter.isAllowed(`login:${phone}`, 5, 15 * 60 * 1000);
};
```

Usage in login form:

```typescript
import { checkLoginRateLimit } from '@/lib/rate-limiter';
import { logSuspiciousActivity } from '@/lib/security-logger';

const handleLogin = async (data: LoginFormData) => {
  if (!checkLoginRateLimit(data.phone)) {
    logSuspiciousActivity(undefined, 'Rate limit exceeded for login', {
      phone: data.phone,
    });
    toast.error('Too many login attempts. Please try again later.');
    return;
  }
  
  // Proceed with login
  await signIn('credentials', data);
};
```

---

## Priority 6: Add CSRF Protection (MEDIUM)

### Implementation

NextAuth.js already provides CSRF protection for its endpoints. For custom API endpoints:

Create `src/lib/csrf.ts`:

```typescript
/**
 * CSRF Token Management
 */

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Store CSRF token in sessionStorage
 */
export function setCsrfToken(token: string): void {
  sessionStorage.setItem('csrf-token', token);
}

/**
 * Get CSRF token from sessionStorage
 */
export function getCsrfToken(): string | null {
  return sessionStorage.getItem('csrf-token');
}

/**
 * Validate CSRF token
 */
export function validateCsrfToken(token: string): boolean {
  const storedToken = getCsrfToken();
  return storedToken === token;
}
```

Usage in API client:

```typescript
// In src/lib/api.ts, add CSRF token to headers
private buildHeaders(options?: ApiRequestOptions): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  // Add CSRF token for state-changing requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(options?.method || '')) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
  }

  return headers;
}
```

---

## Testing Security Improvements

### Automated Testing

Add to `package.json`:

```json
{
  "scripts": {
    "security:headers": "curl -I http://localhost:3000 | grep -E 'X-|Content-Security'",
    "security:audit": "npm audit --production",
    "security:check": "npm run security:audit && npm run lint"
  }
}
```

### Manual Testing Checklist

- [ ] Verify security headers in production
- [ ] Test XSS payloads against sanitized inputs
- [ ] Verify rate limiting works
- [ ] Test CSRF protection
- [ ] Verify tokens are stored securely
- [ ] Test authentication flow end-to-end
- [ ] Verify authorization for different roles
- [ ] Test session timeout behavior

---

## Monitoring and Alerting

### Set Up Monitoring Dashboard

1. **Integrate Sentry for Error Tracking**
2. **Set up security event dashboard**
3. **Configure alerts for critical events:**
   - Multiple failed login attempts
   - Authorization failures
   - Suspicious activity patterns
   - Token manipulation attempts

### Metrics to Track

- Authentication success/failure rate
- Authorization failures
- XSS attempt detection (sanitization hits)
- Rate limit hits
- Session timeout events
- Token refresh failures

---

## Maintenance Schedule

### Weekly
- [ ] Review security logs
- [ ] Check for new npm vulnerabilities
- [ ] Review rate limit statistics

### Monthly
- [ ] Run security audit
- [ ] Review and update CSP policy
- [ ] Update dependencies
- [ ] Review access control rules

### Quarterly
- [ ] Full security assessment
- [ ] Penetration testing (if applicable)
- [ ] Review and update security documentation
- [ ] Security training for team

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/Top10/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [Sentry Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Security Headers](https://securityheaders.com/)

---

## Questions or Issues?

If you encounter issues implementing these security improvements, please:
1. Review the OWASP_TOP_10_ANALYSIS.md for context
2. Check the SECURITY.md for general security guidelines
3. Consult the Next.js security documentation
4. Open an issue for discussion
