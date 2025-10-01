# GitHub Copilot Instructions for Quizify UI

This repository contains the frontend for Quizify, a quiz management platform built with modern web technologies.

## Tech Stack

- **Next.js 15** (App Router, Turbopack)
- **React 19** with TypeScript 5 (strict mode)
- **TanStack Query** for server state management
- **NextAuth.js v5** for authentication
- **next-intl** for internationalization (uz, ru, en)
- **shadcn/ui + Radix UI** for components
- **Tailwind CSS 4** for styling
- **Zod** for schema validation
- **React Hook Form** for forms

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
├── components/
│   ├── features/[feature]/       # Feature-specific components
│   │   ├── components/           # Feature components
│   │   ├── hooks/               # Feature hooks
│   │   ├── schemas/             # Feature Zod schemas
│   │   ├── services/            # Feature API services
│   │   └── types/               # Feature types
│   ├── shared/ui/               # Shared UI components
│   └── ui/                      # shadcn/ui components
├── lib/                         # Utilities and shared logic
└── i18n/                        # Internationalization config
```

## Naming Conventions

- **Components**: PascalCase with `.tsx` extension (`UserProfile.tsx`)
- **Hooks**: camelCase with `use` prefix (`useUsers.ts`)
- **Services**: camelCase with `Service` suffix (`userService.ts`)
- **Schemas**: camelCase with `Schema` suffix (`userSchema.ts`)
- **Types/Interfaces**: PascalCase, prefixed with `T` for types, `I` for interfaces (`TUser`, `IUserProps`)
- **Path Aliases**: Always use `@/` for `src/` imports
- **Do not modify shadcn/ui component names**

## Code Style Guidelines

### TypeScript

- Use strict mode with explicit types
- Avoid `any` - use `unknown` or proper types
- Prefer type inference when obvious
- Use discriminated unions for complex state

### Component Patterns

- Use function components and hooks
- Separate presentational (dumb) and container (smart) components
- Keep business logic in hooks or service layer, not in components
- Prefer local state for UI logic; use TanStack Query for server state
- Validate forms with Zod, manage with React Hook Form

Example:

```tsx
// Container component
export function UserListContainer() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getUsers,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return <UserList users={data} />;
}

// Presentational component
interface UserListProps {
  users: TUser[];
}

export function UserList({ users }: UserListProps) {
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

## API Integration

- All backend communication via dedicated service layer in `src/components/features/[feature]/services/`
- Use TanStack Query for data fetching and caching
- Validate API requests/responses with Zod schemas
- Handle errors gracefully with proper error boundaries
- Use access/refresh tokens with NextAuth.js v5
- Base API URL: `NEXT_PUBLIC_API_BASE_URL` (default: `http://localhost:8080/api`)

## Internationalization (i18n)

- **Supported languages**: Uzbek (uz), Russian (ru), English (en)
- **All user-facing text must be translatable** using `next-intl`
- Use descriptive translation keys: `auth.login.button`, `instructor.quiz.form.title`
- Never hardcode user-facing strings
- Test UI with varied text lengths across languages

Example:

```tsx
import { useTranslations } from 'next-intl';

export function LoginButton() {
  const t = useTranslations();
  return <button>{t('auth.login.button')}</button>;
}
```

## Accessibility & Performance

- Use semantic HTML elements
- Ensure keyboard navigation works (tab order, focus management)
- Add ARIA attributes where needed
- Test with screen readers
- Optimize images with `next/image`
- Use dynamic imports for code splitting
- Follow WCAG guidelines

## Best Practices

1. **Dependencies**: Keep updated, use exact versions in package.json
2. **Error Handling**: Handle loading states, errors, and edge cases gracefully
3. **Type Safety**: Validate all API data with Zod before using
4. **Co-location**: Keep related files together (components, styles, types, tests)
5. **Documentation**: Document complex logic, hooks, and services with JSDoc comments
6. **Testing**: Write tests for critical paths (services, hooks, complex components)
7. **Commits**: Use descriptive commit messages following conventional commits

## MCP Integration

This project uses Model Context Protocol (MCP) servers:

- **backend-filesystem**: Access to backend codebase for alignment
- **swagger**: OpenAPI spec at `https://quizifybackend-b86e8709a4d9.herokuapp.com/v3/api-docs`

When implementing new features:

- Check the Swagger/OpenAPI spec for API contracts
- Generate TypeScript types if needed: `npx -y openapi-typescript <swagger-url> -o src/types/generated/api.d.ts`
- Keep UI types aligned with backend DTOs
- Normalize null values to undefined for forms/components

## Common Patterns

### Form with Validation

```tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    // Handle submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  );
}
```

### Data Fetching with TanStack Query

```tsx
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useQuizzes() {
  return useQuery({
    queryKey: ['quizzes'],
    queryFn: quizService.getQuizzes,
  });
}

export function useCreateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: quizService.createQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    },
  });
}
```

## Environment Variables

Required:

- `NEXTAUTH_SECRET` — NextAuth.js authentication secret
- `NEXT_PUBLIC_API_BASE_URL` — Backend API base URL

Optional:

- `NEXTAUTH_URL` — Usually auto-detected
- `SKIP_ENV_VALIDATION` — Skip env checks for Docker/CI

## Development Workflow

1. Install dependencies: `npm install`
2. Set up `.env.local` with required environment variables
3. Run dev server: `npm run dev`
4. Lint code: `npm run lint` and `npm run lint:ts`
5. Format code: `npm run pretty`
6. Build: `npm run build`
7. Run tests: `npm run test`

## Linting and Formatting

- ESLint with Next.js + TypeScript rules
- Prettier for code formatting and import sorting
- Husky for pre-commit hooks
- Run `npm run lint` before committing
- Run `npm run pretty` to format code

## What to Avoid

- ❌ Using `any` type without justification
- ❌ Hardcoding user-facing strings (use i18n)
- ❌ Putting API logic in components (use services)
- ❌ Ignoring TypeScript errors
- ❌ Skipping accessibility attributes
- ❌ Directly accessing `process.env` in `src/` (triggers ESLint error)
- ❌ Modifying shadcn/ui component files
- ❌ Committing sensitive data or secrets

## Feature Development Checklist

When adding new features:

- [ ] Create feature directory under `src/components/features/[feature]/`
- [ ] Define types in `types/` subdirectory
- [ ] Create Zod schemas in `schemas/` subdirectory
- [ ] Implement service layer in `services/` subdirectory
- [ ] Build components following container/presentational pattern
- [ ] Add custom hooks in `hooks/` subdirectory if needed
- [ ] Add all user-facing text to i18n translation files
- [ ] Validate all API data with Zod
- [ ] Handle loading, error, and empty states
- [ ] Add accessibility attributes (ARIA labels, keyboard navigation)
- [ ] Write tests for critical functionality
- [ ] Update documentation if needed
