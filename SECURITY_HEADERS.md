# Security Headers Implementation Guide

This document explains the security headers implemented in the application to address **A05:2021 – Security Misconfiguration** from the OWASP Top 10.

## Overview

Security headers have been added to `next.config.ts` to protect against common web vulnerabilities including clickjacking, XSS, MIME sniffing, and other attacks.

## Implemented Headers

### 1. X-Content-Type-Options

**Value:** `nosniff`

**Purpose:** Prevents MIME type sniffing attacks

**Protection:** Stops browsers from interpreting files as a different MIME type than declared by the server. This prevents attackers from uploading malicious files disguised as safe types.

**Example Attack Prevented:**
- Attacker uploads `malicious.jpg` that contains JavaScript
- Without header: Browser might execute it as JavaScript
- With header: Browser respects the declared MIME type and won't execute it

### 2. X-Frame-Options

**Value:** `DENY`

**Purpose:** Prevents clickjacking attacks

**Protection:** Prevents the application from being embedded in `<iframe>`, `<frame>`, `<embed>`, or `<object>` tags on other websites.

**Example Attack Prevented:**
- Attacker creates malicious site with invisible iframe overlaying your app
- User thinks they're clicking on attacker's site but actually clicking your app
- With DENY header: Browser refuses to load the page in an iframe

**Alternative Values:**
- `SAMEORIGIN` - Allows framing only from same origin
- `DENY` - Completely prevents framing (recommended)

### 3. X-XSS-Protection

**Value:** `1; mode=block`

**Purpose:** Enables XSS filtering in legacy browsers

**Protection:** Activates built-in XSS filters in older browsers (IE, Safari, Chrome <78).

**Note:** Modern browsers rely on Content Security Policy instead. This header provides defense-in-depth for older browsers.

**Mode Options:**
- `0` - Disables filter
- `1` - Enables filter (sanitizes page)
- `1; mode=block` - Enables filter and blocks rendering if attack detected (recommended)

### 4. Referrer-Policy

**Value:** `strict-origin-when-cross-origin`

**Purpose:** Controls referrer information sent with requests

**Protection:** Prevents leaking sensitive information in URLs to third-party sites.

**Behavior:**
- Same origin: Full URL sent as referrer
- Cross-origin (HTTPS→HTTPS): Only origin sent
- Cross-origin (HTTPS→HTTP): No referrer sent

**Example:**
```
Your page: https://quizify.com/student/quiz/123?token=secret
Link to: https://external.com

Without policy: Referrer = https://quizify.com/student/quiz/123?token=secret
With policy: Referrer = https://quizify.com
```

### 5. Permissions-Policy

**Value:** `camera=(), microphone=(), geolocation=(), interest-cohort=()`

**Purpose:** Controls which browser features can be used

**Protection:** Prevents unauthorized access to sensitive browser APIs.

**Features Disabled:**
- `camera=()` - No camera access
- `microphone=()` - No microphone access
- `geolocation=()` - No location access
- `interest-cohort=()` - Blocks FLoC tracking

**To Enable a Feature:**
```typescript
// Allow camera only for same origin
'camera=(self)'

// Allow camera for specific domain
'camera=(self "https://trusted-domain.com")'
```

### 6. Strict-Transport-Security (HSTS)

**Value:** `max-age=31536000; includeSubDomains; preload`

**Purpose:** Enforces HTTPS connections

**Protection:** Forces browsers to only connect via HTTPS, preventing protocol downgrade attacks.

**Applied:** Production only

**Parameters:**
- `max-age=31536000` - Remember for 1 year (365 days)
- `includeSubDomains` - Apply to all subdomains
- `preload` - Allow inclusion in browser HSTS preload list

**Example Attack Prevented:**
- User on public WiFi types `http://quizify.com`
- Attacker intercepts and serves fake login page
- With HSTS: Browser automatically upgrades to HTTPS
- Attack fails because attacker can't provide valid certificate

**HSTS Preload:**
To add to Chrome's preload list: https://hstspreload.org/

### 7. Content-Security-Policy (CSP)

**Value:** Comprehensive policy (see below)

**Purpose:** Controls which resources can be loaded

**Protection:** Prevents XSS, clickjacking, and other injection attacks by whitelisting trusted sources.

**Policy Breakdown:**

```typescript
// Default fallback - only same origin
default-src 'self'

// Scripts - Next.js requires unsafe-eval and unsafe-inline
// New Relic monitoring allowed
script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js-agent.newrelic.com

// Styles - Tailwind and styled-jsx require unsafe-inline
// Google Fonts allowed
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com

// Images - allow self, data URIs, and HTTPS images
img-src 'self' blob: data: https:

// Fonts - Google Fonts and data URIs allowed
font-src 'self' data: https://fonts.gstatic.com

// API connections - backend and New Relic
connect-src 'self' ${API_BASE_URL} https://bam.nr-data.net

// Prevent all framing
frame-ancestors 'none'

// Base tag restriction
base-uri 'self'

// Form submission restriction
form-action 'self'

// Upgrade HTTP to HTTPS (production only)
upgrade-insecure-requests
```

## CSP Security Levels

### Current Implementation: Level 2 (Moderate)

**Why `unsafe-inline` and `unsafe-eval`?**
- Next.js uses inline scripts for hydration
- Styled components and Tailwind use inline styles
- React uses eval in development mode

**Future Improvements (Level 3 - Strict):**
1. Use nonces for inline scripts: `script-src 'self' 'nonce-{random}'`
2. Generate nonces per request
3. Remove `unsafe-eval` in production
4. Use CSS-in-JS with nonces

**Example Strict CSP:**
```typescript
script-src 'self' 'nonce-${nonce}'
style-src 'self' 'nonce-${nonce}'
```

## Testing Security Headers

### 1. Manual Testing (Development)

Start the development server:
```bash
npm run dev
```

Check headers in browser DevTools:
1. Open DevTools (F12)
2. Go to Network tab
3. Reload page
4. Click on the document request
5. View Response Headers

### 2. Production Testing

After deployment, test with curl:
```bash
# Check all headers
curl -I https://your-domain.com

# Check specific header
curl -I https://your-domain.com | grep -i "content-security-policy"
```

### 3. Online Security Scanners

**Security Headers:**
- https://securityheaders.com/
- Enter your domain
- Get letter grade (aim for A or A+)

**Mozilla Observatory:**
- https://observatory.mozilla.org/
- Comprehensive security scan
- Provides specific recommendations

**CSP Evaluator:**
- https://csp-evaluator.withgoogle.com/
- Analyzes CSP policy
- Identifies weaknesses

### 4. Expected Results

**Good Configuration:**
```
HTTP/2 200
x-content-type-options: nosniff
x-frame-options: DENY
x-xss-protection: 1; mode=block
referrer-policy: strict-origin-when-cross-origin
permissions-policy: camera=(), microphone=(), geolocation=()
strict-transport-security: max-age=31536000; includeSubDomains; preload
content-security-policy: default-src 'self'; ...
```

**Security Headers Score:** A or A+

## Common Issues and Solutions

### Issue 1: CSP Blocking Resources

**Symptom:** Images, fonts, or scripts not loading

**Solution:** Add source to appropriate directive
```typescript
// Allow images from CDN
"img-src 'self' https://cdn.example.com"

// Allow fonts from specific domain
"font-src 'self' https://fonts.example.com"
```

### Issue 2: Inline Scripts Blocked

**Symptom:** Console errors about inline scripts

**Temporary Solution:** Add `'unsafe-inline'` (current implementation)

**Better Solution:** Use nonces
```typescript
// In next.config.ts
script-src 'self' 'nonce-${nonce}'

// In component
<script nonce={nonce}>...</script>
```

### Issue 3: Third-party Service Blocked

**Symptom:** Analytics, monitoring, or chat widget not working

**Solution:** Add to CSP
```typescript
// Example: Add Google Analytics
"script-src 'self' https://www.googletagmanager.com",
"connect-src 'self' https://www.google-analytics.com"
```

### Issue 4: HSTS Not Working Locally

**Expected:** HSTS only applies in production

**Reason:** HTTP is fine for localhost

**To Test:** Deploy to production or use HTTPS locally

## CSP Reporting

### Enable CSP Violation Reporting

Add `report-uri` or `report-to` directive:

```typescript
// Report violations to endpoint
"report-uri /api/csp-report",

// Or use Report-To API (newer)
"report-to csp-endpoint"
```

Create reporting endpoint:
```typescript
// app/api/csp-report/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  console.error('CSP Violation:', body);
  
  // Log to monitoring service
  // await logSecurityEvent('CSP_VIOLATION', body);
  
  return new Response('OK', { status: 200 });
}
```

### Report-Only Mode

Test CSP without blocking:
```typescript
// In next.config.ts
{
  key: 'Content-Security-Policy-Report-Only',
  value: 'default-src \'self\'; report-uri /api/csp-report'
}
```

## Environment-Specific Configuration

### Development
- Relaxed CSP for debugging
- No HSTS (HTTP allowed)
- Detailed error messages

### Production
- Strict CSP
- HSTS enabled
- upgrade-insecure-requests enabled

### Configuration in next.config.ts
```typescript
const isProduction = process.env.NODE_ENV === 'production';

headers: [
  // HSTS only in production
  ...(isProduction ? [{
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload'
  }] : []),
  
  // Stricter CSP in production
  {
    key: 'Content-Security-Policy',
    value: isProduction 
      ? strictPolicy 
      : relaxedPolicy
  }
]
```

## Monitoring and Maintenance

### Regular Checks

**Weekly:**
- Review CSP violation reports
- Check for new security headers

**Monthly:**
- Scan with securityheaders.com
- Update CSP policy as needed
- Review third-party scripts

**Quarterly:**
- Security audit
- Update to latest best practices
- Test HSTS preload status

### Updating Headers

When adding new features:
1. Test locally with strict CSP
2. Add necessary exceptions
3. Document why exceptions needed
4. Plan to remove exceptions when possible

## Best Practices

### ✅ Do:
- Start with strict policy, relax as needed
- Use specific sources, not wildcards
- Document all exceptions
- Test on staging before production
- Monitor CSP violations
- Keep headers up to date

### ❌ Don't:
- Use `unsafe-inline` without plan to remove
- Allow `*` in any directive
- Ignore CSP violation reports
- Disable headers for debugging
- Forget to test after changes

## Future Improvements

### Short-term (1-2 weeks)
1. Implement CSP reporting endpoint
2. Remove unnecessary `unsafe-inline` uses
3. Add nonces for critical inline scripts

### Medium-term (1-2 months)
1. Full nonce-based CSP
2. Remove `unsafe-eval` in production
3. Implement Subresource Integrity (SRI)
4. Add HSTS preload

### Long-term (3-6 months)
1. Achieve CSP Level 3 (strict)
2. Implement all security headers best practices
3. Regular automated security scanning
4. Security headers in CI/CD pipeline

## Resources

- [MDN Security Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers#security)
- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [CSP Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Security Headers Best Practices](https://securityheaders.com/)
- [Content Security Policy Reference](https://content-security-policy.com/)

## Support

For issues with security headers:
- Review `SECURITY.md` for security guidelines
- Check `OWASP_TOP_10_ANALYSIS.md` for overall security posture
- Consult `SECURITY_IMPROVEMENTS.md` for implementation guides
