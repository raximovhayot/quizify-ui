# Project Guidelines

## Build & Configuration

### Environment Setup

**Required:**
- `NEXTAUTH_SECRET` — NextAuth.js authentication secret
- `NEXT_PUBLIC_API_BASE_URL` — Backend API base URL (default: `http://localhost:8080/api`)

**Optional for dev:**
- `NEXTAUTH_URL` — Usually auto-detected
- `NEXT_PUBLIC_ENV_NAME`, `NEXT_PUBLIC_ENV_EMOJI`, `NEXT_PUBLIC_ENV_COLOR_SCHEME` — Environment display settings
- `SKIP_ENV_VALIDATION` — Skip env checks (mainly for Docker)

---

### Development Workflow

1. Install dependencies: `npm install`
2. Add environment variables to `.env.local`
3. Run dev server: `npm run dev` (uses Turbopack)
4. Build for production: `npm run build`
5. Start production server: `npm start`

---

### Core Technologies

- **Next.js 15 (App Router, Turbopack)**
- **React 19 + TypeScript 5**
- **TanStack Query** for server state
- **NextAuth.js v5** for authentication
- **next-intl** for i18n
- **shadcn/ui + Radix UI** for components
- **Tailwind CSS 4** for styling
- **Zod** for schema validation
- **React Hook Form** for forms

---

## Testing

- **Jest** + **React Testing Library**
  ```bash
  npm test         # Run all tests
  npm test:watch   # Watch mode
  ```
- Config: `jest.config.js`, setup: `jest.setup.js` (includes `@testing-library/jest-dom`)
- DOM env: jsdom
- Path alias: `@/*` → `src/*`
- Place tests as `.test.tsx` or in `__tests__` folders alongside components.

**Example:**
```typescript
import { render, screen } from '@testing-library/react'
import { ComponentName } from '../component-name'

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName>Test</ComponentName>)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

---

## Code Style & Project Structure

- **TypeScript**: Strict mode, explicit types, avoid `any`
- **ESLint**: Next.js + TypeScript rules
- **Prettier**: Formatting & import sorting
- **Husky**: Pre-commit hooks
- **Path Aliases**: Use `@/` for `src/` imports

**Structure:**
- All source in `src/`
- **Features**: `src/components/features/[feature]/`
- **Shared UI**: `src/components/ui/`
- **Hooks**: `src/components/features/[feature]/hooks/`
- **Schemas**: `src/components/features/[feature]/schemas/`
- Co-locate tests, styles, and types with related code

---

## Component & State Management

- Use function components and hooks; prefer local state for UI logic
- Use TanStack Query for API/server state
- Use global state libs (Zustand, Jotai) only for truly shared state
- Separate presentational (dumb) and container (smart) components
- API/server logic lives in API routes or service layer, not in components
- Validate forms with Zod, manage forms with React Hook Form

---

## API Integration & Authentication

- All backend communication via a dedicated service layer
- Use TanStack Query or fetch for API calls
- Validate and handle errors using Zod schemas
- Use access/refresh tokens for authentication
- NextAuth.js v5 for authentication; sessions verified server-side

---

## Git & Branching

- Use descriptive commit messages
- Create feature branches for new work
- Open pull requests for code review before merging

---

## Backend & MCP Integration

- Use MCP Backend Filesystem server for business logic/codebase access
- Use MCP Swagger server for API documentation/specs
- Generate TypeScript types from Swagger specs for type safety
- Design service layer to match backend contracts
- Implement robust error handling based on API patterns

---

## Internationalization (i18n)

- Supported: **uz** (Uzbek), **ru** (Russian), **en** (English)
- All user-facing text must be translatable using `next-intl`
- Use descriptive translation keys (`auth.login.button`)
- Test UI with varied text lengths

---

## Best Practices

- Keep dependencies updated
- Follow accessibility (WCAG) guidelines
- Optimize performance (images, bundle size, code splitting)
- Use semantic HTML, ARIA attributes for accessibility
- Validate API requests/responses with Zod
- Handle errors and loading states gracefully
- Externalize all text for i18n
- Maintain tests for components, hooks, and services

---

## Accessibility & Performance

- Use semantic HTML
- Ensure keyboard navigation & focus management
- Test with screen readers
- Optimize images/assets, use Next.js tools (`next/image`, dynamic imports)
- Regularly audit bundle size

---

## Logging & Analytics

- Use Sentry or similar for error monitoring
- Never log sensitive user info
- Use structured logging

---

## Contribution

- Follow code style and commit guidelines
- Document components, hooks, and services
- Review and test code before merging

---