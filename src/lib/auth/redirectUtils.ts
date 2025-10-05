export function sanitizeRedirect(input: string | null | undefined): string | null {
  if (typeof input !== 'string') return null;
  let value = input.trim();
  if (!value) return null;

  // Remove hash fragment early
  const hashIndex = value.indexOf('#');
  if (hashIndex >= 0) value = value.slice(0, hashIndex);

  // Reject absolute URLs or protocol-relative URLs
  const lower = value.toLowerCase();
  if (/^[a-z][a-z0-9+.-]*:/.test(lower)) return null; // e.g., http:, https:, javascript:
  if (lower.startsWith('//')) {
    // Collapse multiple leading slashes to a single slash and continue as relative
    value = '/' + value.replace(/^\/+/, '');
  }

  // Must start with a single '/'
  if (!value.startsWith('/')) return null;

  // Normalize path using URL parsing to handle encodings
  let url: URL;
  try {
    url = new URL('http://localhost' + value);
  } catch {
    return null;
  }

  const pathname = normalizePath(url.pathname);
  const search = normalizeSearch(url.search);

  const result = pathname + search;
  // Ensure the result is still a rooted relative path
  if (!result.startsWith('/')) return null;
  return result;
}

function normalizePath(pathname: string): string {
  // Split and resolve '.' and '..' segments safely
  const parts = pathname.split('/');
  const stack: string[] = [];
  for (const raw of parts) {
    const part = decodeComponentSafe(raw);
    if (!part || part === '.') continue;
    if (part === '..') {
      if (stack.length > 0) stack.pop();
      continue;
    }
    stack.push(part);
  }
  return '/' + stack.join('/');
}

function normalizeSearch(search: string): string {
  if (!search) return '';
  // Reconstruct search to avoid dangerous params; currently we pass-through.
  // Could add allow-list here if needed later.
  try {
    const params = new URLSearchParams(search);
    return params.toString() ? `?${params.toString()}` : '';
  } catch {
    return '';
  }
}

function decodeComponentSafe(input: string): string {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}
