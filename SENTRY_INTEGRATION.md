# Sentry Error Tracking Integration Guide

This guide explains how to set up and use Sentry for centralized error tracking in Quizify UI.

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Configuration](#configuration)
- [Usage](#usage)
- [Features](#features)
- [Testing](#testing)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

Sentry is a centralized error tracking and performance monitoring platform that helps you:

- **Detect errors in real-time** - Get instant notifications when errors occur
- **Debug faster** - See full stack traces, breadcrumbs, and context
- **Monitor performance** - Track slow operations and bottlenecks
- **Track releases** - See which version introduced bugs
- **Session replay** - Watch user sessions to understand issues

### Why Sentry?

- ✅ **Industry standard** - Used by 100K+ organizations
- ✅ **Next.js native support** - Official SDK for Next.js 15
- ✅ **Comprehensive** - Errors, performance, session replay
- ✅ **Privacy-focused** - Configurable data masking
- ✅ **Open source** - Can self-host if needed

---

## Setup

### Step 1: Create Sentry Account

1. Go to [sentry.io](https://sentry.io/)
2. Sign up for a free account (up to 5K errors/month free)
3. Create a new project:
   - **Platform**: Next.js
   - **Project name**: quizify-ui
   - **Team**: Your organization

### Step 2: Get Your DSN

After creating the project, you'll receive a **Data Source Name (DSN)**:

```
https://abc123def456@o123456.ingest.sentry.io/7890123
```

This is your unique project identifier - keep it secure!

### Step 3: Configure Environment Variables

Add to your `.env.local` file:

```bash
# Sentry Error Tracking
NEXT_PUBLIC_ENABLE_SENTRY=true
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn-here@sentry.io/project-id
NEXT_PUBLIC_APP_VERSION=1.0.0
```

**For different environments:**

```bash
# Development
NEXT_PUBLIC_ENABLE_SENTRY=false  # Optional in dev

# Staging
NEXT_PUBLIC_ENABLE_SENTRY=true
NEXT_PUBLIC_SENTRY_DSN=https://staging-dsn@sentry.io/staging-id

# Production
NEXT_PUBLIC_ENABLE_SENTRY=true
NEXT_PUBLIC_SENTRY_DSN=https://production-dsn@sentry.io/production-id
```

### Step 4: Verify Installation

The Sentry SDK is already installed and configured in:
- ✅ `sentry.client.config.ts` - Client-side configuration
- ✅ `sentry.server.config.ts` - Server-side configuration  
- ✅ `sentry.edge.config.ts` - Edge runtime configuration

---

## Configuration

### Sentry Configuration Files

#### 1. Client Configuration (`sentry.client.config.ts`)

Handles browser errors, performance, and session replay:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of error sessions
});
```

#### 2. Server Configuration (`sentry.server.config.ts`)

Handles server-side errors in API routes and server components:

```typescript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.05, // Lower on server
});
```

#### 3. Edge Configuration (`sentry.edge.config.ts`)

Handles middleware errors:

```typescript
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.01, // Minimal for edge
});
```

### Sample Rates Explained

**Traces Sample Rate** - Percentage of performance transactions to capture:
- `1.0` = 100% (development - full monitoring)
- `0.1` = 10% (production - reduce costs)
- `0.01` = 1% (high-traffic apps)

**Replay Sample Rate** - Percentage of user sessions to record:
- `0.1` = 10% of normal sessions
- `1.0` = 100% of sessions with errors

Lower rates = lower costs and data usage.

---

## Usage

### Automatic Error Tracking

Errors are automatically captured in:

✅ **React Components** - Error boundaries catch component errors
✅ **API Routes** - Server-side API errors
✅ **Middleware** - Edge runtime errors  
✅ **Async Operations** - Unhandled promise rejections
✅ **Console Errors** - Logged errors

### Manual Error Tracking

Use the error tracking utility for custom error reporting:

```typescript
import { captureException, captureMessage } from '@/lib/error-tracking';

// Capture an exception
try {
  await riskyOperation();
} catch (error) {
  captureException(error, {
    componentName: 'QuizForm',
    actionName: 'submit-quiz',
    userId: user.id,
    tags: { quizId: quiz.id },
  });
  throw error;
}

// Capture a message (non-error event)
captureMessage('User completed quiz', {
  userId: user.id,
  tags: { quizId: quiz.id, score: '90' },
});
```

### Set User Context

Associate errors with specific users:

```typescript
import { setUserContext, clearUserContext } from '@/lib/error-tracking';

// After login
setUserContext(user.id, user.email, {
  phone: user.phone,
  roles: user.roles.join(','),
});

// After logout  
clearUserContext();
```

**Privacy Note**: User context is already set automatically in the authentication flow.

### Add Breadcrumbs

Breadcrumbs are events leading up to an error:

```typescript
import { addBreadcrumb } from '@/lib/error-tracking';

// Navigation breadcrumb
addBreadcrumb('User navigated to quiz page', 'navigation', {
  quizId: quiz.id,
  from: 'dashboard',
});

// User action breadcrumb
addBreadcrumb('User clicked submit button', 'user-action', {
  formValid: true,
  answersCount: 10,
});

// API breadcrumb
addBreadcrumb('Fetching quiz data', 'api', {
  endpoint: '/api/quizzes/123',
  method: 'GET',
});
```

### Wrap Functions with Error Tracking

Automatically catch and report errors in async functions:

```typescript
import { withErrorTracking } from '@/lib/error-tracking';

const fetchQuiz = withErrorTracking(
  async (quizId: string) => {
    const response = await fetch(`/api/quizzes/${quizId}`);
    return response.json();
  },
  { componentName: 'QuizLoader', actionName: 'fetch-quiz' }
);
```

### Performance Monitoring

Track slow operations:

```typescript
import { startTransaction } from '@/lib/error-tracking';

const transaction = startTransaction('quiz-submission', 'http.client');
try {
  await submitQuiz(data);
  transaction?.setStatus('ok');
} catch (error) {
  transaction?.setStatus('internal_error');
  throw error;
} finally {
  transaction?.finish();
}
```

---

## Features

### 1. Error Boundaries Integration

All errors caught by React error boundaries are automatically sent to Sentry:

```tsx
<ErrorBoundary feature="quiz">
  <QuizComponent />
</ErrorBoundary>
```

Sentry receives:
- Error message and stack trace
- Component stack
- User context
- Breadcrumbs
- Device and browser info

### 2. Session Replay

Watch user sessions that experienced errors:

- **Masked by default** - All text and media masked for privacy
- **Click tracking** - See what users clicked
- **Network requests** - See API calls
- **Console logs** - Debug messages

Configure in Sentry dashboard: **Settings > Replays**

### 3. Performance Monitoring

Track application performance:

- **Page load time** - Initial load performance
- **API response time** - Backend latency
- **Component render time** - React performance
- **Database queries** - Server-side queries

View in Sentry: **Performance > Transactions**

### 4. Release Tracking

Track which version introduced bugs:

```bash
# Set version in environment
NEXT_PUBLIC_APP_VERSION=1.2.3
```

Sentry will:
- Associate errors with releases
- Track error introduction
- Show release health metrics

### 5. Alerts and Notifications

Configure alerts in Sentry dashboard:

1. Go to **Settings > Alerts**
2. Create alert rule:
   - **Condition**: Error count > 10 in 5 minutes
   - **Action**: Email, Slack, PagerDuty, etc.
3. Set up integrations (Slack, Discord, etc.)

---

## Testing

### Test Error Tracking

Use the test utility in development:

```typescript
import { testErrorTracking } from '@/lib/error-tracking';

// Only works in development
testErrorTracking();
```

Check Sentry dashboard: **Issues > All Issues**

### Test Different Error Types

```typescript
// 1. Test exception capture
try {
  throw new Error('Test error');
} catch (error) {
  captureException(error, {
    tags: { test: 'true' },
  });
}

// 2. Test message capture
captureMessage('Test message', {
  tags: { test: 'true' },
});

// 3. Test user feedback
import { showUserFeedbackDialog } from '@/lib/error-tracking';
showUserFeedbackDialog();
```

### Verify Integration

1. Trigger a test error
2. Check Sentry dashboard (may take 1-2 minutes)
3. Verify you see:
   - Error details
   - Stack trace
   - Breadcrumbs
   - Device info
   - User context (if set)

---

## Best Practices

### 1. Use Meaningful Error Messages

```typescript
// ❌ Bad
throw new Error('Error');

// ✅ Good
throw new Error('Failed to submit quiz: validation failed');
```

### 2. Add Context to Errors

```typescript
// ❌ Bad
captureException(error);

// ✅ Good
captureException(error, {
  componentName: 'QuizForm',
  actionName: 'submit-quiz',
  userId: user.id,
  tags: {
    quizId: quiz.id,
    questionCount: questions.length,
  },
  additionalData: {
    formData: sanitizedFormData, // Never log sensitive data!
  },
});
```

### 3. Don't Log Sensitive Data

```typescript
// ❌ Never log
- Passwords
- Credit card numbers
- Personal health info
- Full names
- Email addresses (unless necessary)
- Phone numbers

// ✅ Safe to log
- User IDs
- Transaction IDs
- Error codes
- Public usernames
- Timestamps
```

### 4. Filter Expected Errors

Some errors are expected and shouldn't alert you:

```typescript
// In sentry.client.config.ts
ignoreErrors: [
  'NetworkError',
  'Failed to fetch',
  'User aborted',
  'Hydration failed', // Next.js hydration
],
```

### 5. Use Proper Severity Levels

```typescript
import { ErrorSeverity } from '@/lib/error-tracking';

// FATAL - Application crash
captureException(error, context, ErrorSeverity.FATAL);

// ERROR - Feature broken
captureException(error, context, ErrorSeverity.ERROR);

// WARNING - Degraded functionality
captureMessage('Slow API response', context, ErrorSeverity.WARNING);

// INFO - Informational
captureMessage('User exported data', context, ErrorSeverity.INFO);
```

### 6. Clean Up User Context

Always clear user context on logout:

```typescript
// Automatically done in next-auth.config.ts
clearUserContext();
```

---

## Troubleshooting

### Common Issues

#### 1. Errors Not Showing in Sentry

**Check:**
- ✅ `NEXT_PUBLIC_ENABLE_SENTRY=true`
- ✅ `NEXT_PUBLIC_SENTRY_DSN` is correct
- ✅ DSN includes `/project-id` at the end
- ✅ Wait 1-2 minutes for errors to appear
- ✅ Check Sentry dashboard filters (environment, time range)

**Solution:**
```bash
# Verify DSN
echo $NEXT_PUBLIC_SENTRY_DSN

# Test with
testErrorTracking()
```

#### 2. Too Many Errors

**Problem**: Sentry quota exceeded

**Solutions:**
- Lower sample rates in config files
- Add more errors to `ignoreErrors` list
- Filter by environment (only production)
- Upgrade Sentry plan

#### 3. Sensitive Data Leaked

**Problem**: PII visible in Sentry

**Solutions:**
- Set `sendDefaultPii: false` (already set)
- Enable data scrubbing in Sentry dashboard
- Review `beforeSend` filter
- Use session replay masking

#### 4. Performance Impact

**Problem**: App feels slower

**Solutions:**
- Lower `tracesSampleRate` to 0.01 or less
- Disable session replay in production
- Use lazy loading for Sentry init
- Check network tab for Sentry requests

### Debug Mode

Enable debug logging:

```bash
# In sentry.client.config.ts (development only)
debug: true
```

Check browser console for Sentry messages.

### Verify Configuration

```bash
# Check environment variables
npm run dev
# Look for: "✅ Sentry client-side error tracking initialized"
```

---

## Integration with Existing Systems

### Works Seamlessly With

✅ **Security Logger** - Both systems work together
✅ **New Relic** - Can run simultaneously
✅ **Error Boundaries** - Automatic integration
✅ **NextAuth.js** - User context synced
✅ **TanStack Query** - API errors captured

### Data Flow

```
User Action
    ↓
Error Occurs
    ↓
Error Boundary Catches
    ↓
Security Logger (audit trail)
    ↓
Sentry (centralized tracking)
    ↓
Alerts/Dashboard
```

---

## Cost Optimization

### Free Tier Limits

- **5,000 errors/month**
- **10,000 performance events/month**
- **50 session replays/month**
- **1 user**
- **90 days retention**

### Stay Within Free Tier

```typescript
// Production optimized config
{
  tracesSampleRate: 0.01,      // 1% of transactions
  replaysSessionSampleRate: 0, // No normal sessions
  replaysOnErrorSampleRate: 1, // Only error sessions
}
```

### When to Upgrade

Upgrade when you need:
- More than 5K errors/month
- Team collaboration (multiple users)
- Longer retention (90+ days)
- Advanced features (custom alerts, integrations)
- Priority support

---

## Resources

### Documentation

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Error Tracking Best Practices](https://docs.sentry.io/product/sentry-basics/integrate-frontend/initialize-sentry-sdk/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)

### Support

- **Sentry Dashboard**: [sentry.io](https://sentry.io)
- **Documentation**: [docs.sentry.io](https://docs.sentry.io)
- **Community**: [Discord](https://discord.gg/sentry)
- **GitHub**: [getsentry/sentry-javascript](https://github.com/getsentry/sentry-javascript)

### Alternative Tools

If Sentry doesn't fit your needs:

- **LogRocket** - Session replay focus
- **Rollbar** - Error tracking
- **Bugsnag** - Error monitoring
- **New Relic** - APM focus (already integrated)
- **Self-hosted** - Sentry open-source

---

## Summary

Centralized error tracking with Sentry provides:

✅ **Real-time error detection**
✅ **Full context and debugging info**
✅ **Session replay for hard-to-reproduce bugs**
✅ **Performance monitoring**
✅ **Release tracking**
✅ **Team collaboration**
✅ **Integration with security logger**

**Next Steps:**
1. Sign up for Sentry account
2. Get your DSN
3. Add to `.env.local`
4. Deploy and monitor
5. Configure alerts

**Questions?** Check the troubleshooting section or Sentry documentation.
