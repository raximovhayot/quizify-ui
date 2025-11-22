export type TUserLike = {
  roles?: Array<{ name?: string | null } | null> | null;
  defaultDashboard?: unknown;
} | null | undefined;

export type TDashboard = '/dashboard';

/**
 * Normalize dashboard preference to a known route or null.
 */
export function normalizeDashboard(value: unknown): TDashboard | null {
  if (value == null) return null;
  // All users now use the unified dashboard
  return '/dashboard';
}

/**
 * Pick the most appropriate dashboard for a given user based on roles and preference.
 *
 * Rules:
 * - All users with STUDENT or INSTRUCTOR roles use the unified /dashboard.
 * - If no valid roles, return null.
 */
export function pickDashboard(user: TUserLike): TDashboard | null {
  const roles = (user?.roles ?? []).filter(Boolean) as Array<{ name?: string | null }>;
  const hasStudentRole = roles.some((r) => r?.name === 'STUDENT');
  const hasInstructorRole = roles.some((r) => r?.name === 'INSTRUCTOR');

  if (hasStudentRole || hasInstructorRole) return '/dashboard';
  return null;
}
