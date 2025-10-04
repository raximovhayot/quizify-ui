/**
 * Tests for HTML sanitization utilities
 */
import { sanitizeHtml, sanitizeHtmlWithConfig } from '../sanitize';

describe('sanitizeHtml', () => {
  it('should remove script tags', () => {
    const malicious = '<p>Hello</p><script>alert("XSS")</script>';
    const result = sanitizeHtml(malicious);
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('alert');
    expect(result).toContain('<p>Hello</p>');
  });

  it('should remove event handlers', () => {
    const malicious = '<img src="x" onerror="alert(\'XSS\')">';
    const result = sanitizeHtml(malicious);
    expect(result).not.toContain('onerror');
    expect(result).not.toContain('alert');
  });

  it('should remove javascript: protocol', () => {
    const malicious = '<a href="javascript:alert(\'XSS\')">Click me</a>';
    const result = sanitizeHtml(malicious);
    expect(result).not.toContain('javascript:');
    expect(result).not.toContain('alert');
  });

  it('should allow safe HTML tags', () => {
    const safe = '<p>Hello <strong>world</strong></p><ul><li>Item 1</li></ul>';
    const result = sanitizeHtml(safe);
    expect(result).toContain('<p>');
    expect(result).toContain('<strong>');
    expect(result).toContain('<ul>');
    expect(result).toContain('<li>');
  });

  it('should handle empty or invalid input', () => {
    expect(sanitizeHtml('')).toBe('');
    expect(sanitizeHtml(null as unknown as string)).toBe('');
    expect(sanitizeHtml(undefined as unknown as string)).toBe('');
  });

  it('should preserve headings', () => {
    const content = '<h1>Title</h1><h2>Subtitle</h2><h3>Section</h3>';
    const result = sanitizeHtml(content);
    expect(result).toContain('<h1>');
    expect(result).toContain('<h2>');
    expect(result).toContain('<h3>');
  });

  it('should preserve code blocks', () => {
    const content = '<pre><code>const x = 5;</code></pre>';
    const result = sanitizeHtml(content);
    expect(result).toContain('<pre>');
    expect(result).toContain('<code>');
  });

  it('should remove iframe tags', () => {
    const malicious =
      '<iframe src="data:text/html,<script>alert(\'XSS\')</script>"></iframe>';
    const result = sanitizeHtml(malicious);
    expect(result).not.toContain('<iframe');
    expect(result).not.toContain('script');
  });

  it('should remove SVG with event handlers', () => {
    const malicious = '<svg onload="alert(\'XSS\')"></svg>';
    const result = sanitizeHtml(malicious);
    expect(result).not.toContain('onload');
    expect(result).not.toContain('alert');
  });
});

describe('sanitizeHtmlWithConfig', () => {
  it('should allow custom configuration', () => {
    const html = '<p class="test">Hello</p><span>World</span>';
    const result = sanitizeHtmlWithConfig(html, {
      ALLOWED_TAGS: ['p'],
      ALLOWED_ATTR: [],
    });
    expect(result).toContain('<p>');
    expect(result).not.toContain('class');
    expect(result).not.toContain('<span>');
    // Content should be preserved even when tags are removed
    expect(result).toContain('World');
  });
});
