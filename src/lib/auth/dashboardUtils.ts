export type TUserLike = {
  roles?: Array<{ name?: string | null } | null> | null;
  defaultDashboard?: unknown;
} | null | undefined;

export type TDashboard = '/';

/**
 * Normalize dashboard preference to a known route or null.
 */
export function normalizeDashboard(value: unknown): TDashboard | null {
  if (value == null) return null;
  // All users now use the unified dashboard (root)
  return '/';
}

/**
 * Pick the most appropriate dashboard for a given user.
 *
 * Rules:
 * - All authenticated users use the unified /dashboard.
 * - If no user, return null.
 */
export function pickDashboard(user: TUserLike): TDashboard | null {
  if (!user) return null;
  return '/';
}
