/* @jest-environment node */
import { middleware } from '../../../middleware';

jest.mock('@/components/features/auth/config/next-auth.config', () => ({
  auth: jest.fn(),
}));

// Types are not required at runtime; we keep shapes minimal
const { auth } = jest.requireMock(
  '@/components/features/auth/config/next-auth.config'
) as { auth: jest.Mock };

function makeReq(path: string) {
  const req = {
    nextUrl: { pathname: path },
    url: 'http://localhost' + path,
  };
  return req as unknown as Parameters<typeof middleware>[0];
}

describe('middleware redirects', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('redirects unauthenticated / to /sign-in', async () => {
    auth.mockResolvedValue(null);
    const res = await middleware(makeReq('/'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost/sign-in');
  });

  it('redirects / for student role to /student', async () => {
    auth.mockResolvedValue({ user: { roles: [{ name: 'STUDENT' }] } });
    const res = await middleware(makeReq('/'));
    expect(res.headers.get('location')).toBe('http://localhost/student');
  });

  it('redirects / for instructor role to /instructor', async () => {
    auth.mockResolvedValue({ user: { roles: [{ name: 'INSTRUCTOR' }] } });
    const res = await middleware(makeReq('/'));
    expect(res.headers.get('location')).toBe('http://localhost/instructor');
  });

  it('redirects unauth /student to sign-in with safe redirect', async () => {
    auth.mockResolvedValue(null);
    const res = await middleware(makeReq('/student'));
    expect(res.headers.get('location')).toBe(
      'http://localhost/sign-in?redirect=%2Fstudent'
    );
  });

  it('sanitizes malicious redirect input', async () => {
    auth.mockResolvedValue(null);
    // path traversal should be normalized to '/'
    const res = await middleware(makeReq('/student/%2e%2e'));
    // Because matcher for /student triggers, redirect param should become '/'
    expect(res.headers.get('location')).toBe(
      'http://localhost/sign-in?redirect=%2F'
    );
  });

  it('signed-in visiting /sign-in goes to dashboard', async () => {
    auth.mockResolvedValue({ user: { roles: [{ name: 'STUDENT' }] } });
    const res = await middleware(makeReq('/sign-in'));
    expect(res.headers.get('location')).toBe('http://localhost/student');
  });
});
