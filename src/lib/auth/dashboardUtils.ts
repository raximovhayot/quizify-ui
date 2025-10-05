export type TUserLike = {
  roles?: Array<{ name?: string | null } | null> | null;
  defaultDashboard?: unknown;
} | null | undefined;

export type TDashboard = '/student' | '/instructor';

/**
 * Normalize dashboard preference to a known route or null.
 */
export function normalizeDashboard(value: unknown): TDashboard | null {
  if (value == null) return null;
  try {
    const v = String(value).trim().toLowerCase();
    if (!v) return null;
    if (v.includes('student')) return '/student';
    if (v.includes('instructor')) return '/instructor';
    return null;
  } catch {
    return null;
  }
}

/**
 * Pick the most appropriate dashboard for a given user based on roles and preference.
 *
 * Rules:
 * - If user has a valid preference that matches an allowed role, honor it.
 * - Otherwise: if both roles, default to student.
 * - Else: return the role the user actually has.
 * - If no valid roles, return null.
 */
export function pickDashboard(user: TUserLike): TDashboard | null {
  const roles = (user?.roles ?? []).filter(Boolean) as Array<{ name?: string | null }>;
  const hasStudentRole = roles.some((r) => r?.name === 'STUDENT');
  const hasInstructorRole = roles.some((r) => r?.name === 'INSTRUCTOR');

  const preferred = normalizeDashboard(user?.defaultDashboard);
  if (preferred === '/student' && hasStudentRole) return '/student';
  if (preferred === '/instructor' && hasInstructorRole) return '/instructor';

  if (hasStudentRole && hasInstructorRole) return '/student';
  if (hasStudentRole) return '/student';
  if (hasInstructorRole) return '/instructor';
  return null;
}
