# Security Guidelines

This document outlines the security practices and guidelines for the Quizify UI project.

## XSS (Cross-Site Scripting) Prevention

### Overview

The application uses rich text editing capabilities through Tiptap, which generates HTML content that needs to be displayed to users. To prevent XSS attacks, all HTML content is sanitized before rendering.

### HTML Sanitization

We use **DOMPurify** (via `isomorphic-dompurify` for SSR compatibility) to sanitize all user-generated HTML content before rendering it in the browser.

#### Sanitization Function

Location: `src/lib/sanitize.ts`

```typescript
import { sanitizeHtml } from '@/lib/sanitize';

// Sanitize HTML content
const safeHtml = sanitizeHtml(userContent);
```

#### Allowed HTML Tags

The sanitization configuration allows the following safe HTML tags:

**Text Formatting:**
- `<p>`, `<br>`, `<strong>`, `<em>`, `<u>`, `<s>`, `<code>`, `<pre>`

**Headings:**
- `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>`, `<h6>`

**Lists:**
- `<ul>`, `<ol>`, `<li>`

**Block Elements:**
- `<blockquote>`, `<div>`, `<span>`

**Links (if needed):**
- `<a>` with attributes: `href`, `target`, `rel`

#### Protected Components

The following components automatically sanitize HTML content:

1. **RichTextDisplay** (`src/components/shared/form/RichTextEditor.tsx`)
   - Used for displaying rich text content in read-only mode
   - Automatically sanitizes all content before rendering

2. **Student Components:**
   - `AttemptResults` - Sanitizes question content in quiz results
   - `QuestionDisplay` - Sanitizes question content during quiz attempts

3. **Instructor Components:**
   - `EssayGradingTable` - Sanitizes question text in grading interface
   - `GradeEssayDialog` - Sanitizes question text in grading dialog
   - `QuestionAnalyticsTable` - Sanitizes question text in analytics

### Best Practices

#### ✅ DO

1. **Always sanitize user-generated HTML:**
   ```tsx
   import { sanitizeHtml } from '@/lib/sanitize';
   
   <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
   ```

2. **Use RichTextDisplay for rich text content:**
   ```tsx
   import { RichTextDisplay } from '@/components/shared/form/RichTextEditor';
   
   <RichTextDisplay content={userContent} />
   ```

3. **Validate and sanitize on both client and server:**
   - Client-side sanitization prevents XSS in the browser
   - Server-side validation provides defense in depth

4. **Keep DOMPurify updated:**
   ```bash
   npm update isomorphic-dompurify
   ```

#### ❌ DON'T

1. **Never use dangerouslySetInnerHTML without sanitization:**
   ```tsx
   // ❌ DANGEROUS - DO NOT DO THIS
   <div dangerouslySetInnerHTML={{ __html: userContent }} />
   ```

2. **Don't trust content from any source:**
   - Even content from your own API should be sanitized
   - Database content could have been compromised
   - Third-party integrations may send malicious content

3. **Don't modify the sanitization config without review:**
   - Adding new allowed tags should be carefully reviewed
   - Some tags like `<iframe>`, `<object>`, `<embed>` should never be allowed
   - Script-related attributes should always be blocked

### Custom Sanitization

If you need custom sanitization rules for specific use cases:

```typescript
import { sanitizeHtmlWithConfig } from '@/lib/sanitize';

const customSanitized = sanitizeHtmlWithConfig(content, {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
  ALLOWED_ATTR: ['class'],
});
```

### Testing for XSS

When testing the application, try these common XSS payloads to ensure sanitization works:

```html
<!-- Basic script injection -->
<script>alert('XSS')</script>

<!-- Event handler injection -->
<img src="x" onerror="alert('XSS')">

<!-- JavaScript protocol -->
<a href="javascript:alert('XSS')">Click me</a>

<!-- Data URI -->
<iframe src="data:text/html,<script>alert('XSS')</script>"></iframe>

<!-- SVG-based XSS -->
<svg onload="alert('XSS')"></svg>
```

All of these should be sanitized and rendered harmless.

## Content Security Policy (CSP)

### Current Status

⚠️ **TODO**: Implement Content Security Policy headers in production

### Recommended CSP Headers

```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' https://quizifybackend-b86e8709a4d9.herokuapp.com;
  frame-ancestors 'none';
```

## Other Security Considerations

### Authentication

- Use NextAuth.js v5 for authentication
- Store JWT tokens securely in HTTP-only cookies
- Implement proper session management
- Use refresh tokens for long-lived sessions

### API Security

- Validate all API responses with Zod schemas
- Sanitize data before displaying to users
- Handle API errors gracefully without exposing sensitive information
- Use HTTPS for all API communication

### Environment Variables

- Never commit `.env.local` or files with secrets to git
- Use `NEXT_PUBLIC_*` prefix only for non-sensitive client-side variables
- Keep `NEXTAUTH_SECRET` secure and rotated regularly
- Use environment-specific configurations

### Dependencies

- Regularly update dependencies to patch security vulnerabilities
- Run `npm audit` to check for known vulnerabilities
- Review dependency changes in pull requests
- Use `npm audit fix` to automatically fix vulnerabilities

### Reporting Security Issues

If you discover a security vulnerability, please report it to:

- **Email**: [security contact email]
- **Do NOT** create a public GitHub issue for security vulnerabilities
- Provide detailed steps to reproduce the issue
- Allow time for the team to address the issue before public disclosure

## Security Checklist for Pull Requests

When reviewing pull requests, verify:

- [ ] No use of `dangerouslySetInnerHTML` without sanitization
- [ ] All user input is validated and sanitized
- [ ] No sensitive data exposed in client-side code
- [ ] No secrets committed to the repository
- [ ] Dependencies updated and audited
- [ ] XSS testing performed on new features
- [ ] Proper error handling without information disclosure
- [ ] Authentication/authorization checks in place

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security)
- [React Security Best Practices](https://react.dev/learn/writing-markup-with-jsx#the-rules-of-jsx)

---

Last updated: 2024
