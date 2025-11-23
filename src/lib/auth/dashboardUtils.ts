export type TUserLike = {
  roles?: Array<{ name?: string | null } | null> | null;
  defaultDashboard?: unknown;
} | null | undefined;

export type TDashboard = '/';


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
