import { sanitizeRedirect } from '../../auth/redirectUtils';

describe('sanitizeRedirect', () => {
  it('accepts simple relative paths', () => {
    expect(sanitizeRedirect('/student')).toBe('/student');
    expect(sanitizeRedirect('/student?x=1&y=2')).toBe('/student?x=1&y=2');
  });

  it('collapses duplicate slashes', () => {
    expect(sanitizeRedirect('//student')).toBe('/student');
    expect(sanitizeRedirect('///instructor///')).toBe('/instructor');
  });

  it('removes fragments', () => {
    expect(sanitizeRedirect('/student#section')).toBe('/student');
  });

  it('rejects absolute URLs and protocols', () => {
    expect(sanitizeRedirect('http://evil.com')).toBeNull();
    expect(sanitizeRedirect('https://quizify.app/student')).toBeNull();
    expect(sanitizeRedirect('javascript:alert(1)')).toBeNull();
  });

  it('prevents traversal, normalizes encoded segments', () => {
    expect(sanitizeRedirect('/student/..')).toBe('/');
    expect(sanitizeRedirect('/student/%2e%2e')).toBe('/');
    expect(sanitizeRedirect('/a/./b/../c')).toBe('/a/c');
  });

  it('returns null for non-rooted or invalid', () => {
    expect(sanitizeRedirect('student')).toBeNull();
    expect(sanitizeRedirect('')).toBeNull();
    expect(sanitizeRedirect(undefined)).toBeNull();
  });
});
