### Auth Routing & Provider Strategy

This document summarizes how we scope middleware and client providers, and how redirects work across public and protected areas.

#### Matcher scope (middleware.ts)

We run middleware only where it matters to reduce edge CPU and latency:

- `/student/:path*`
- `/instructor/:path*`
- `/profile/:path*`
- `/join`
- `/sign-in`
- `/`

Public assets and API routes are excluded by design.

#### Redirect matrix (high level)

- `/`:
  - Unauth → `/sign-in`
  - Auth (STUDENT) → `/student`
  - Auth (INSTRUCTOR) → `/instructor`
  - Auth (both roles): honor `defaultDashboard` when valid else `/student`
- `/sign-in`, `/join`:
  - Signed-in → redirect to preferred dashboard
  - Signed-out → allow
- Protected routes (`/student`, `/instructor`, `/profile/...`):
  - Unauth → `/sign-in?redirect=<safe>` (safe = sanitized relative path)
  - Auth but wrong role → redirect to an available dashboard (`/student` or `/instructor`)
  - New users (`UserState.NEW`) → `/profile/complete` (no loop on that route)

#### Role preference resolution

Helpers in `src/lib/auth/dashboardUtils.ts`:

- `normalizeDashboard(value)` → `'/student' | '/instructor' | null`
- `pickDashboard(user)` → prefers `user.defaultDashboard` when it matches a role the user actually has; otherwise falls back to role-based defaults.

#### Redirect safety

Helper in `src/lib/auth/redirectUtils.ts`:

- `sanitizeRedirect(input)` returns a relative path like `/student` or `null`.
- Rules:
  - Reject absolute/protocol-relative URLs (e.g., `https://…`, `//host`).
  - Must start with `/` after collapsing duplicates; drop `#fragment`.
  - Normalize and strip `.`/`..` (including encoded variants) to prevent traversal.
  - Preserve query string when valid.

We apply this when setting `?redirect=` for unauthenticated access.

#### Provider scoping

- Root layout (`src/app/layout.tsx`) is server-only — no client providers here.
- Authenticated groups (`/student`, `/instructor`) mount `ClientProviders` in their group layouts.
- Public-only group mounts `PublicClientProviders` in its layout.

This keeps RSC streaming and static optimization intact for public pages and only ships client JS where needed.

#### Notes

- Deprecated `Providers.tsx` remains in the repo for reference but is blocked via ESLint (`no-restricted-imports`) to avoid accidental use.
- Tests live near helpers and middleware for fast feedback.
