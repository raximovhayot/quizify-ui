# New Relic Integration Guide

This guide explains how to integrate New Relic with the security logging system for advanced monitoring and alerting.

## Prerequisites

1. A New Relic account (sign up at https://newrelic.com/)
2. New Relic Browser agent license key
3. Application ID from New Relic

## Installation

### Option 1: Script Tag Integration (Recommended for Next.js)

Add the New Relic Browser script to your application layout:

**File: `src/app/layout.tsx`**

```tsx
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* New Relic Browser Agent */}
        {process.env.NEXT_PUBLIC_ENABLE_NEW_RELIC === 'true' && (
          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: `
                window.NREUM||(NREUM={});NREUM.init={
                  distributed_tracing:{enabled:true},
                  privacy:{cookies_enabled:true},
                  ajax:{deny_list:["bam.nr-data.net"]}
                };
                window.NREUM.loader_config={
                  accountID:"${process.env.NEXT_PUBLIC_NEW_RELIC_ACCOUNT_ID}",
                  trustKey:"${process.env.NEXT_PUBLIC_NEW_RELIC_ACCOUNT_ID}",
                  agentID:"${process.env.NEXT_PUBLIC_NEW_RELIC_APP_ID}",
                  licenseKey:"${process.env.NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY}",
                  applicationID:"${process.env.NEXT_PUBLIC_NEW_RELIC_APP_ID}"
                };
                window.NREUM.loader_config.sa=1;
              `,
            }}
          />
        )}
        {process.env.NEXT_PUBLIC_ENABLE_NEW_RELIC === 'true' && (
          <script
            src="https://js-agent.newrelic.com/nr-loader-spa-current.min.js"
            type="text/javascript"
          />
        )}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers messages={messages} locale={locale}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### Option 2: NPM Package (Alternative)

```bash
npm install @newrelic/browser-agent
```

Then create a New Relic initialization file:

**File: `src/lib/newrelic.ts`**

```typescript
import { BrowserAgent } from '@newrelic/browser-agent/loaders/browser-agent';

let agent: BrowserAgent | null = null;

export function initNewRelic() {
  if (
    typeof window === 'undefined' ||
    process.env.NEXT_PUBLIC_ENABLE_NEW_RELIC !== 'true'
  ) {
    return;
  }

  if (!agent) {
    agent = new BrowserAgent({
      init: {
        distributed_tracing: { enabled: true },
        privacy: { cookies_enabled: true },
        ajax: { deny_list: ['bam.nr-data.net'] },
      },
      info: {
        beacon: 'bam.nr-data.net',
        errorBeacon: 'bam.nr-data.net',
        licenseKey: process.env.NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY!,
        applicationID: process.env.NEXT_PUBLIC_NEW_RELIC_APP_ID!,
        sa: 1,
      },
      loader_config: {
        accountID: process.env.NEXT_PUBLIC_NEW_RELIC_ACCOUNT_ID!,
        trustKey: process.env.NEXT_PUBLIC_NEW_RELIC_ACCOUNT_ID!,
        agentID: process.env.NEXT_PUBLIC_NEW_RELIC_APP_ID!,
        licenseKey: process.env.NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY!,
        applicationID: process.env.NEXT_PUBLIC_NEW_RELIC_APP_ID!,
      },
    });
  }

  return agent;
}

export function getNewRelicAgent() {
  return agent;
}
```

## Environment Variables

Add these to your `.env.local` file:

```bash
# New Relic Configuration
NEXT_PUBLIC_ENABLE_NEW_RELIC=true
NEXT_PUBLIC_NEW_RELIC_ACCOUNT_ID=your_account_id
NEXT_PUBLIC_NEW_RELIC_APP_ID=your_app_id
NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY=your_license_key
```

**Security Note:** These are client-side variables (NEXT_PUBLIC_*), so they will be exposed in the browser. This is expected for New Relic Browser monitoring.

## Security Events Logged to New Relic

The security logger automatically sends the following events to New Relic when enabled:

### Authentication Events
- `AUTH_SUCCESS` - Successful login
- `AUTH_FAILURE` - Failed login attempt
- `AUTH_LOGOUT` - User logout
- `AUTH_SESSION_EXPIRED` - Session expiration
- `AUTH_TOKEN_REFRESH` - Token refresh success
- `AUTH_TOKEN_REFRESH_FAILED` - Token refresh failure

### Authorization Events
- `AUTHZ_FAILURE` - Authorization denied
- `AUTHZ_ROLE_MISMATCH` - User role doesn't match required roles

### Security Events
- `SUSPICIOUS_ACTIVITY` - Detected suspicious behavior
- `XSS_ATTEMPT_BLOCKED` - XSS attempt blocked by sanitization
- `RATE_LIMIT_EXCEEDED` - Rate limit hit
- `INVALID_INPUT` - Invalid input validation

### System Events
- `ERROR_BOUNDARY_TRIGGERED` - React error boundary caught error
- `API_ERROR` - API request error
- `NETWORK_ERROR` - Network connectivity error

## Viewing Security Events in New Relic

### 1. Custom Events Dashboard

Navigate to **Browser** → **Your App** → **Custom Events** to see all security events.

Query example:
```sql
SELECT * FROM PageAction 
WHERE actionName = 'SecurityEvent' 
SINCE 1 day ago
```

### 2. Security Dashboard

Create a custom dashboard with these queries:

**Failed Login Attempts (Last 24h):**
```sql
SELECT count(*) FROM PageAction 
WHERE actionName = 'SecurityEvent' 
AND eventType = 'AUTH_FAILURE' 
SINCE 1 day ago
```

**XSS Attempts Blocked:**
```sql
SELECT count(*) FROM PageAction 
WHERE actionName = 'SecurityEvent' 
AND eventType = 'XSS_ATTEMPT_BLOCKED' 
SINCE 1 day ago
```

**Authorization Failures by User:**
```sql
SELECT userId, count(*) FROM PageAction 
WHERE actionName = 'SecurityEvent' 
AND eventType IN ('AUTHZ_FAILURE', 'AUTHZ_ROLE_MISMATCH') 
FACET userId 
SINCE 1 day ago
```

**Critical Security Events:**
```sql
SELECT * FROM PageAction 
WHERE actionName = 'SecurityEvent' 
AND severity = 'critical' 
SINCE 1 day ago
```

### 3. Alerts Configuration

Set up alerts for critical security events:

1. Go to **Alerts & AI** → **Alert Conditions**
2. Create a new NRQL alert condition
3. Use queries like:

**Alert on Multiple Failed Logins:**
```sql
SELECT count(*) FROM PageAction 
WHERE actionName = 'SecurityEvent' 
AND eventType = 'AUTH_FAILURE'
```
Threshold: Alert when count > 5 within 5 minutes

**Alert on Suspicious Activity:**
```sql
SELECT count(*) FROM PageAction 
WHERE actionName = 'SecurityEvent' 
AND severity = 'critical'
```
Threshold: Alert when count > 0 within 1 minute

**Alert on XSS Attempts:**
```sql
SELECT count(*) FROM PageAction 
WHERE actionName = 'SecurityEvent' 
AND eventType = 'XSS_ATTEMPT_BLOCKED'
```
Threshold: Alert when count > 10 within 10 minutes

## Custom Metrics

The security logger also tracks custom metrics:

```javascript
// In New Relic Insights
SELECT average(duration) FROM Transaction 
WHERE appName = 'quizify-ui' 
FACET name
```

## Notification Channels

Configure notification channels in New Relic:

1. **Email Notifications**
   - Go to Alerts & AI → Notification channels
   - Add Email channel for security team

2. **Slack Integration**
   - Add Slack webhook for real-time alerts
   - Create #security-alerts channel

3. **PagerDuty Integration**
   - For critical production incidents
   - Route to on-call team

## Best Practices

1. **Monitor Trends**
   - Set up weekly reports for security metrics
   - Look for unusual patterns in failed logins
   - Track XSS attempt rates

2. **Regular Review**
   - Review security dashboard weekly
   - Investigate critical events immediately
   - Update alert thresholds based on baseline

3. **Privacy Considerations**
   - Don't log sensitive data (passwords, tokens)
   - Mask PII in logs
   - Follow GDPR/privacy compliance

4. **Performance**
   - New Relic adds minimal overhead (<50ms)
   - Events are batched and sent asynchronously
   - Configure sampling rates for high-traffic apps

## Troubleshooting

### New Relic Not Loading

1. Check environment variables are set correctly
2. Verify license key is valid
3. Check browser console for errors
4. Ensure script is loading before app code

### Events Not Appearing

1. Check `window.newrelic` is defined in console
2. Verify `NEXT_PUBLIC_ENABLE_NEW_RELIC=true`
3. Check New Relic account has Browser monitoring enabled
4. Wait 5-10 minutes for data to appear

### High Data Ingestion

1. Implement sampling for high-frequency events
2. Filter out noisy events
3. Use New Relic's data management tools

## Alternative: Sentry Integration

If you prefer Sentry over New Relic, the security logger is compatible. Simply:

1. Install Sentry:
```bash
npm install @sentry/nextjs
```

2. Initialize Sentry in `sentry.client.config.ts`

3. The security logger will work alongside Sentry's error tracking

## Support

For issues with New Relic integration:
- New Relic Docs: https://docs.newrelic.com/docs/browser/
- Community Forum: https://discuss.newrelic.com/
- Support: support@newrelic.com

For security logger issues:
- Check `SECURITY.md` for general security guidelines
- Review `OWASP_TOP_10_ANALYSIS.md` for security analysis
