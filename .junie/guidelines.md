# Quizify UI - Development Guidelines

## Quick Start

### Environment Setup

**Required Environment Variables:**
```bash
# Authentication
NEXTAUTH_SECRET=your-secret-key-here

# API Configuration  
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

**Optional Development Variables:**
```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000  # auto-detected in development

# Environment Display (for staging/development indicators)
NEXT_PUBLIC_ENV_NAME=LOCAL
NEXT_PUBLIC_ENV_EMOJI=🚧
NEXT_PUBLIC_ENV_COLOR_SCHEME=warning

# Skip environment validation (mainly for Docker)
SKIP_ENV_VALIDATION=true
```

### Development Workflow

1. **Install dependencies:** `npm install`
2. **Setup environment:** Copy `.env.example` to `.env.local` and configure
3. **Run development server:** `npm run dev` (uses Turbopack for fast builds)
4. **Lint code:** `npm run lint` and `npm run lint:ts`
5. **Format code:** `npm run pretty`
6. **Run tests:** `npm run test` or `npm run test:watch`
7. **Build for production:** `npm run build`
8. **Start production server:** `npm start`

---

## Tech Stack

### Core Technologies
- **Next.js 15** with App Router and Turbopack
- **React 19** with TypeScript 5 (strict mode)
- **TanStack Query v5** for server state management
- **NextAuth.js v5** for authentication
- **next-intl v4** for internationalization
- **shadcn/ui + Radix UI** for accessible components
- **Tailwind CSS 4** for styling
- **Zod v4** for schema validation
- **React Hook Form v7** for form management

### Development Tools
- **ESLint** with Next.js and TypeScript rules
- **Prettier** with import sorting
- **Husky** for pre-commit hooks
- **Jest + Testing Library** for unit/integration testing
- **TypeScript** with strict configuration

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (public-only)/     # Public routes (auth pages)
│   ├── instructor/        # Instructor role pages
│   ├── student/           # Student role pages
│   └── profile/           # Profile pages
├── components/
│   ├── features/          # Feature-specific components
│   │   ├── auth/          # Authentication feature
│   │   │   ├── components/    # React components
│   │   │   ├── hooks/         # Custom hooks
│   │   │   ├── schemas/       # Zod validation schemas
│   │   │   ├── services/      # API service layer
│   │   │   └── types/         # TypeScript types
│   │   ├── profile/       # User profile feature
│   │   └── student/       # Student-specific features
│   ├── shared/            # Shared components across features
│   ├── ui/                # shadcn/ui components
│   └── providers/         # React context providers
├── hooks/                 # Global custom hooks
├── lib/                   # Utility libraries
│   ├── api.ts            # API client configuration
│   ├── validation.ts     # Shared validation schemas
│   └── utils.ts          # Utility functions
├── types/                 # Global TypeScript types
├── constants/             # Application constants
├── i18n/                  # Internationalization
│   ├── config.ts         # i18n configuration
│   └── messages/         # Translation files
│       ├── en.json       # English translations
│       ├── ru.json       # Russian translations
│       └── uz.json       # Uzbek translations
└── env.mjs               # Environment validation
```

---

## Naming Conventions

### Files and Directories
- **Components:** PascalCase with `.tsx` extension
  - `UserProfile.tsx`, `PageSignIn.tsx`
- **Hooks:** camelCase with `use` prefix and `.ts` extension  
  - `useAuth.ts`, `useUserProfile.ts`
- **Services:** camelCase with `Service` suffix and `.ts` extension
  - `authService.ts`, `userService.ts`
- **Schemas:** camelCase with schema descriptive name and `.ts` extension
  - `auth.ts` (contains multiple auth schemas), `validation.ts`
- **Types:** camelCase with descriptive name and `.ts` extension
  - `auth.ts`, `api.ts`, `common.ts`
- **Utilities:** camelCase with descriptive names and `.ts` extension
  - `formatDate.ts`, `apiUtils.ts`

### Code Naming
- **Components:** PascalCase (`UserProfile`, `SignInForm`)
- **Hooks:** camelCase with `use` prefix (`useAuth`, `useUserData`)
- **Functions:** camelCase (`handleSubmit`, `formatPhoneNumber`)
- **Variables:** camelCase (`userData`, `isLoading`)
- **Constants:** SCREAMING_SNAKE_CASE (`API_BASE_URL`, `PASSWORD_MIN_LENGTH`)
- **Types:** PascalCase with `T` prefix (`TUser`, `TApiResponse`)
- **Interfaces:** PascalCase with `I` prefix (`IUserProps`, `IApiClient`)
- **Enums:** PascalCase (`UserRole`, `AuthStatus`)

---

## Component Architecture

### Container/Presentational Pattern

**Container Components** (Smart Components):
- Manage state and business logic
- Handle API calls and data fetching
- Use TanStack Query for server state
- Pass data to presentational components

**Presentational Components** (Dumb Components):
- Pure UI components
- Receive data via props
- No business logic or API calls
- Focused on rendering and user interaction

**Example Implementation:**
```tsx
// containers/UserListContainer.tsx
import { useQuery } from '@tanstack/react-query';
import { UserService } from '../services/userService';
import { UserList } from '../components/UserList';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';

export function UserListContainer() {
  const { 
    data: users, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['users'],
    queryFn: UserService.getUsers,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  if (!users?.length) return <EmptyState />;

  return <UserList users={users} />;
}

// components/UserList.tsx
import { TUser } from '../types/user';

interface UserListProps {
  users: TUser[];
}

export function UserList({ users }: UserListProps) {
  return (
    <div className="space-y-4">
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

---

## API Integration & Service Layer

### Service Layer Pattern
All backend communication must go through dedicated service classes:

```tsx
// services/authService.ts
import { apiClient } from '@/lib/api';
import { ApiResponse } from '@/types/api';
import { 
  SignInRequest, 
  SignUpRequest, 
  JWTToken 
} from '../types/auth';

export class AuthService {
  static async signIn(
    phone: string, 
    password: string
  ): Promise<ApiResponse<JWTToken>> {
    const request: SignInRequest = { phone, password };
    return await apiClient.post('/auth/sign-in', request);
  }

  static async signUpPrepare(
    phone: string
  ): Promise<ApiResponse<void>> {
    const request: SignUpPrepareRequest = { phone };
    return await apiClient.post('/auth/sign-up/prepare', request);
  }

  static async refreshToken(
    refreshToken: string
  ): Promise<ApiResponse<JWTToken>> {
    const request: RefreshTokenRequest = { refreshToken };
    return await apiClient.post('/auth/refresh-token', request);
  }
}
```

### TanStack Query Integration
```tsx
// hooks/useAuth.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import { AuthService } from '../services/authService';

export function useSignIn() {
  return useMutation({
    mutationFn: ({ phone, password }: { phone: string; password: string }) =>
      AuthService.signIn(phone, password),
    onSuccess: (data) => {
      // Handle successful sign-in
      localStorage.setItem('accessToken', data.accessToken);
    },
    onError: (error) => {
      // Handle error
      console.error('Sign-in failed:', error);
    },
  });
}

export function useUserProfile() {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: UserService.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

---

## Form Validation & Management

### Zod Schema Factories
Create reusable, localized validation schemas:

```tsx
// schemas/auth.ts
import * as z from 'zod';
import { createPhoneSchema, createPasswordSchema } from '@/lib/validation';

export const createSignInSchema = (t: (key: string) => string) => {
  return z.object({
    phone: createPhoneSchema(t).shape.phone,
    password: createPasswordSchema(t).shape.password,
  });
};

export type SignInFormData = z.infer<ReturnType<typeof createSignInSchema>>;

export const signInFormDefaults: SignInFormData = {
  phone: '',
  password: '',
};
```

### React Hook Form Integration
```tsx
// components/SignInForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { createSignInSchema, signInFormDefaults } from '../schemas/auth';

export function SignInForm() {
  const t = useTranslations();
  const signInSchema = createSignInSchema(t);

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: signInFormDefaults,
  });

  const { mutate: signIn, isPending } = useSignIn();

  const onSubmit = (data: SignInFormData) => {
    signIn(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.phone')}</FormLabel>
              <FormControl>
                <Input {...field} type="tel" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Additional fields... */}
        <Button type="submit" disabled={isPending}>
          {isPending ? t('common.loading') : t('auth.signIn')}
        </Button>
      </form>
    </Form>
  );
}
```

---

## Error Handling

### Custom Error Classes
```tsx
// types/api.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static fromResponse(response: Response, data?: unknown): ApiError {
    return new ApiError(
      `API Error: ${response.status} ${response.statusText}`,
      response.status,
      data
    );
  }
}
```

### Error Display Components
```tsx
// components/ui/ErrorDisplay.tsx
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ApiError } from '@/types/api';

interface ErrorDisplayProps {
  error: unknown;
  retry?: () => void;
}

export function ErrorDisplay({ error, retry }: ErrorDisplayProps) {
  let title = 'An error occurred';
  let description = 'Please try again later';

  if (error instanceof ApiError) {
    title = `Error ${error.status}`;
    description = error.message;
  } else if (error instanceof Error) {
    description = error.message;
  }

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        {description}
        {retry && (
          <Button
            variant="outline"
            size="sm"
            onClick={retry}
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
```

---

## Internationalization (i18n)

### Supported Languages
- **English** (`en`) - Primary language
- **Russian** (`ru`) - Secondary language  
- **Uzbek** (`uz`) - Local language

### Translation Key Structure
Use hierarchical, descriptive keys:
```json
{
  "auth": {
    "signIn": "Sign In",
    "signUp": "Sign Up",
    "validation": {
      "phoneRequired": "Phone number is required",
      "phoneInvalid": "Please enter a valid phone number",
      "passwordRequired": "Password is required",
      "passwordMinLength": "Password must be at least 8 characters"
    }
  },
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "retry": "Try Again",
    "cancel": "Cancel",
    "save": "Save"
  }
}
```

### Usage in Components
```tsx
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations();
  
  return (
    <div>
      <h1>{t('auth.signIn')}</h1>
      <p>{t('auth.validation.phoneRequired')}</p>
    </div>
  );
}
```

---

## Testing

### Testing Setup
- **Jest** for test runner
- **Testing Library** for component testing
- **jsdom** environment for DOM simulation

### Test File Organization
```
src/components/features/auth/
├── components/
│   ├── SignInForm.tsx
│   └── __tests__/
│       └── SignInForm.test.tsx
├── hooks/
│   ├── useAuth.ts
│   └── __tests__/
│       └── useAuth.test.tsx
└── services/
    ├── authService.ts
    └── __tests__/
        └── authService.test.tsx
```

### Example Component Test
```tsx
// __tests__/SignInForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NextIntlClientProvider } from 'next-intl';
import { SignInForm } from '../SignInForm';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const messages = {
  auth: {
    signIn: 'Sign In',
    phone: 'Phone',
    password: 'Password',
  },
};

function renderWithProviders(component: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale="en" messages={messages}>
        {component}
      </NextIntlClientProvider>
    </QueryClientProvider>
  );
}

describe('SignInForm', () => {
  it('renders form fields', () => {
    renderWithProviders(<SignInForm />);
    
    expect(screen.getByLabelText('Phone')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    renderWithProviders(<SignInForm />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    
    await waitFor(() => {
      expect(screen.getByText('Phone number is required')).toBeInTheDocument();
    });
  });
});
```

---

## Code Quality & Standards

### TypeScript Configuration
- **Strict mode enabled** with `noImplicitAny`
- **No unchecked indexed access** for safer array/object access
- **Path aliases** using `@/` for clean imports
- **Explicit return types** for functions and methods

### ESLint Rules
- Next.js recommended rules
- TypeScript recommended rules
- No `process.env` usage in source files (use `env.mjs` instead)
- Unused variables warning (prefix with `_` to ignore)

### Prettier Configuration
- Single quotes, semicolons, 2-space indentation
- Import sorting with grouping:
  1. React imports
  2. Next.js imports  
  3. Internal imports (`@/`)
  4. Relative imports

### Git Hooks
- **Pre-commit:** Prettier formatting via lint-staged
- **Commit messages:** Use conventional commits format

---

## Performance & Accessibility

### Performance Guidelines
- Use Next.js `Image` component for optimized images
- Implement code splitting with dynamic imports
- Use TanStack Query for efficient data caching
- Monitor bundle size regularly
- Lazy load non-critical components

### Accessibility Requirements
- Use semantic HTML elements
- Provide ARIA labels and descriptions
- Ensure keyboard navigation works
- Maintain proper focus management
- Test with screen readers
- Follow WCAG 2.1 AA guidelines

### Example Accessible Component
```tsx
export function AccessibleButton({ 
  children, 
  onClick, 
  disabled = false,
  'aria-label': ariaLabel,
  ...props 
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="focus:ring-2 focus:ring-blue-500 focus:outline-none"
      {...props}
    >
      {children}
    </button>
  );
}
```

---

## Environment & Configuration

### Environment Validation
All environment variables are validated using `@t3-oss/env-nextjs` in `src/env.mjs`:

```javascript
export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']),
    NEXTAUTH_SECRET: z.string().min(1),
    NEXTAUTH_URL: z.string().url().optional(),
  },
  client: {
    NEXT_PUBLIC_API_BASE_URL: z.string().url().default('http://localhost:8080/api'),
    NEXT_PUBLIC_ENV_NAME: z.string().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    // ... other variables
  },
});
```

### MCP Integration
- **Backend Filesystem Server:** Access to business logic and codebase
- **Swagger Server:** API documentation and TypeScript type generation
- **Type Safety:** Generate types from OpenAPI specifications
- **Error Handling:** Follow backend API error patterns

---

## Development Best Practices

### Code Organization
- Keep components small and focused (single responsibility)
- Co-locate related files (components, hooks, types, tests)
- Use barrel exports (`index.ts`) for clean imports
- Separate business logic from UI logic
- Follow established patterns consistently

### State Management
- **Local State:** Use `useState` for component-specific UI state
- **Server State:** Use TanStack Query for API data
- **Global State:** Use Zustand/Jotai only when truly needed across components
- **Form State:** Use React Hook Form for form management

### API Design
- Design service methods to match backend contracts
- Use TypeScript interfaces for request/response types
- Implement proper error handling and loading states
- Cache API responses appropriately with TanStack Query

### Security Considerations
- Never log sensitive user information
- Validate all user inputs with Zod schemas
- Use HTTPS in production
- Implement proper authentication flows
- Sanitize data before displaying

---

## Contribution Guidelines

### Before Contributing
1. **Read these guidelines** thoroughly
2. **Check existing issues** and pull requests
3. **Follow the project structure** and naming conventions
4. **Write tests** for new features and bug fixes
5. **Update documentation** if needed

### Pull Request Process
1. Create a feature branch from `main`
2. Make small, focused commits with clear messages
3. Ensure all tests pass: `npm run test`
4. Lint and format code: `npm run lint && npm run pretty`
5. Update documentation for new features
6. Request code review before merging

### Commit Message Format
```
type(scope): description

feat(auth): add password reset functionality
fix(api): handle network timeout errors  
docs(readme): update installation instructions
style(button): improve hover states
refactor(validation): extract common schema patterns
test(auth): add unit tests for sign-in flow
```

---

This document is a living guide that should be updated as the project evolves. When in doubt, follow existing patterns in the codebase and ask for clarification from the team.