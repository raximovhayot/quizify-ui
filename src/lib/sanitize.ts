/**
 * HTML Sanitization Utilities
 *
 * This module provides utilities for sanitizing HTML content to prevent XSS attacks.
 * It uses DOMPurify with isomorphic-dompurify for both client and server-side support.
 */
import * as DOMPurify from 'isomorphic-dompurify';

/**
 * Configuration for DOMPurify
 * - ALLOWED_TAGS: HTML tags that are allowed in rich text content
 * - ALLOWED_ATTR: HTML attributes that are allowed
 * - KEEP_CONTENT: Keep content even when tags are removed
 */
const PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    // Text formatting
    'p',
    'br',
    'strong',
    'em',
    'u',
    's',
    'code',
    'pre',
    // Headings
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    // Lists
    'ul',
    'ol',
    'li',
    // Block elements
    'blockquote',
    'div',
    'span',
    // Links (if needed in the future)
    'a',
  ],
  ALLOWED_ATTR: [
    // Allow class attributes for styling (e.g., Tailwind classes)
    'class',
    // Allow href for links (with sanitization)
    'href',
    // Allow target for links
    'target',
    // Allow rel for links
    'rel',
  ],
  // Keep content when tags are removed
  KEEP_CONTENT: true,
  // Return a string instead of a DOM fragment
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  // Allow data attributes for custom functionality
  ALLOW_DATA_ATTR: false,
};

/**
 * Sanitizes HTML content to prevent XSS attacks
 *
 * This function uses DOMPurify to remove potentially dangerous HTML/JS
 * while preserving safe formatting tags used by the rich text editor.
 *
 * @param html - The HTML string to sanitize
 * @returns The sanitized HTML string
 *
 * @example
 * ```ts
 * const userInput = '<p>Hello <script>alert("XSS")</script></p>';
 * const safe = sanitizeHtml(userInput);
 * // Returns: '<p>Hello </p>'
 * ```
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(html, PURIFY_CONFIG);
}

/**
 * Sanitizes HTML content with custom configuration
 *
 * Use this when you need more control over the sanitization process.
 *
 * @param html - The HTML string to sanitize
 * @param config - Custom DOMPurify configuration
 * @returns The sanitized HTML string
 */
export function sanitizeHtmlWithConfig(
  html: string,
  config: DOMPurify.Config & { RETURN_DOM_FRAGMENT?: false; RETURN_DOM?: false }
): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  const result = DOMPurify.sanitize(html, { ...PURIFY_CONFIG, ...config });
  return typeof result === 'string' ? result : String(result);
}
