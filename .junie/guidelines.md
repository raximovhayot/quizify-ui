# Project Guidelines (Enhanced for AI Agents)

> **Note**: This document combines human-readable guidelines with AI-specific implementation patterns. For step-by-step workflows, see the **AI Implementation Workflow Guide**.

---

## Table of Contents

1. [Build & Configuration](#build--configuration)
2. [Core Technologies](#core-technologies)
3. [Code Style & Project Structure](#code-style--project-structure)
4. [Component & State Management](#component--state-management)
5. [API Integration & Authentication](#api-integration--authentication)
6. [Form Implementation Patterns](#form-implementation-patterns)
7. [Error Handling Standards](#error-handling-standards)
8. [i18n Best Practices](#i18n-best-practices)
9. [Testing Requirements](#testing-requirements)
10. [AI-Specific Guidelines](#ai-specific-guidelines)

---

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

## Code Style & Project Structure

### TypeScript Rules

- **Strict mode enabled** - no implicit any
- **Explicit return types** for exported functions
- **Interface prefix**: `I` for interfaces, `T` for types
- **Enum naming**: PascalCase
- **Never use `any`** - use `unknown` if type is truly unknown

**Example:**
```typescript
// ✅ CORRECT
export interface IUserProps {
  user: TUser;
  onUpdate: (user: TUser) => void;
}

export type TUser = {
  id: string;
  name: string;
};

// ❌ WRONG
export interface UserProps {
  user: any;
  onUpdate: Function;
}
```

---

### File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| React Components | PascalCase.tsx | `UserProfile.tsx` |
| Hooks | camelCase.ts with `use` prefix | `useUsers.ts` |
| Services | camelCase.ts with `Service` suffix | `userService.ts` |
| Schemas | camelCase.ts with `Schema` suffix | `userSchema.ts` |
| Utils | camelCase.ts | `formatDate.ts` |
| Types | camelCase.ts | `user.ts` (exports `TUser`) |
| Constants | SCREAMING_SNAKE_CASE.ts | `API_ROUTES.ts` |

**Important:** Do NOT change shadcn/ui component names (they use kebab-case in some cases).

---

### Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Route groups
│   ├── instructor/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── courses/
│   │       ├── @modal/           # Parallel routes
│   │       ├── layout.tsx
│   │       └── page.tsx
│   └── student/
├── components/
│   ├── features/                 # Feature-specific components
│   │   └── courses/
│   │       ├── types/            # TypeScript types
│   │       ├── schemas/          # Zod schemas
│   │       ├── services/         # API service layer
│   │       ├── hooks/            # React Query hooks
│   │       ├── components/       # UI components
│   │       ├── keys.ts           # Query keys
│   │       └── routes.ts         # Route constants
│   ├── shared/                   # Shared across features
│   │   ├── ui/                   # Shared UI components
│   │   ├── form/                 # Shared form components
│   │   ├── hooks/                # Shared hooks
│   │   └── providers/            # Context providers
│   └── ui/                       # shadcn/ui components
├── lib/                          # Utility libraries
│   ├── api.ts                    # API client
│   ├── api-utils.ts              # API helpers
│   ├── mutation-utils.ts         # Mutation factories
│   └── validation.ts             # Validation helpers
├── types/                        # Global types
│   ├── api.ts
│   ├── common.ts
│   └── api-endpoints.ts
├── constants/                    # Global constants
│   └── validation.ts
└── middleware/                   # Next.js middleware
```

**Path Aliases:**
- Use `@/` for `src/` imports
- Example: `import { Button } from '@/components/ui/button'`

---

## Component & State Management

### Container/Presentational Pattern

**Rule:** ALWAYS separate data fetching from presentation.

**Container Component** (Smart):
- Handles data fetching with TanStack Query
- Manages local UI state
- Passes data and callbacks to presentational components

**Presentational Component** (Dumb):
- Receives data via props
- Pure rendering logic
- No data fetching or side effects

**Example:**

```typescript
// ✅ CORRECT: Container Component
export function UserListContainer() {
  const t = useTranslations('users');
  
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getUsers,
  });

  if (isLoading) {
    return <FullPageLoading text={t('loading')} />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{t('error.loadFailed')}</AlertDescription>
      </Alert>
    );
  }

  return <UserList users={users || []} />;
}

// ✅ CORRECT: Presentational Component
interface IUserListProps {
  users: TUser[];
}

export function UserList({ users }: IUserListProps) {
  const t = useTranslations('users');
  
  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div key={user.id} className="p-4 border rounded-lg">
          <h3 className="font-semibold">{user.name}</h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      ))}
    </div>
  );
}
```

---

### State Management Rules

**Local UI State:**
```typescript
// Use useState for UI-only state
const [isOpen, setIsOpen] = useState(false);
const [selectedTab, setSelectedTab] = useState('details');
```

**Server State:**
```typescript
// Use TanStack Query for server state
const { data, isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: userService.getUsers,
});
```

**Form State:**
```typescript
// Use React Hook Form for form state
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { name: '', email: '' },
});
```

**Global Client State:**
```typescript
// Use Zustand or Jotai ONLY when truly needed
// (e.g., theme, sidebar state, user preferences)
```

---

## API Integration & Authentication

### Service Layer Pattern

**Rule:** ALL API calls go through dedicated service classes.

**File:** `src/components/features/[feature]/services/[feature]Service.ts`

```typescript
import { apiClient } from '@/lib/api';
import { IApiResponse, extractApiData } from '@/types/api';
import { IPageableList } from '@/types/common';
import { TUser, TUserFilter, TUserCreateRequest } from '../types/user';
import { userDTOSchema, userListResponseSchema } from '../schemas/userSchema';

export class UserService {
  /**
   * Get paginated list of users
   */
  static async getUsers(
    filter: TUserFilter = {},
    signal?: AbortSignal
  ): Promise<IPageableList<TUser>> {
    const response: IApiResponse<IPageableList<TUser>> =
      await apiClient.get('/users', {
        signal,
        query: {
          page: filter.page,
          size: filter.size,
          search: filter.search,
        },
      });

    const data = extractApiData(response);
    return userListResponseSchema.parse(data);
  }

  /**
   * Get single user by ID
   */
  static async getUser(
    userId: string,
    signal?: AbortSignal
  ): Promise<TUser> {
    const response: IApiResponse<TUser> = await apiClient.get(
      '/users/:id',
      { signal, params: { id: userId } }
    );

    const data = extractApiData(response);
    return userDTOSchema.parse(data);
  }

  /**
   * Create a new user
   */
  static async createUser(data: TUserCreateRequest): Promise<TUser> {
    const response: IApiResponse<TUser> = await apiClient.post(
      '/users',
      data
    );

    const result = extractApiData(response);
    return userDTOSchema.parse(result);
  }
}
```

**Service Layer Checklist:**
- [ ] All methods are static
- [ ] AbortSignal parameter for GET requests
- [ ] Use apiClient methods (get, post, put, delete, patch)
- [ ] Path params use `:paramName` syntax
- [ ] Query params in `query` object
- [ ] Always validate responses with Zod
- [ ] Extract data with `extractApiData`
- [ ] JSDoc comments for all methods

---

### React Query Hooks Pattern

**Query Keys:**
```typescript
// src/components/features/users/keys.ts
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filter: TUserFilter) => [...userKeys.lists(), filter] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
} as const;
```

**Query Hook:**
```typescript
// src/components/features/users/hooks/useUsers.ts
export function useUsers(filter: TUserFilter = {}) {
  return useQuery({
    queryKey: userKeys.list(filter),
    queryFn: async ({ signal }) => {
      return UserService.getUsers(filter, signal);
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}
```

**Mutation Hook:**
```typescript
// src/components/features/users/hooks/useCreateUser.ts
export function useCreateUser() {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return createMutation<TUser, TUserCreateRequest>({
    mutationFn: async (data) => {
      const created = await UserService.createUser(data);
      return { data: created, errors: [] };
    },
    successMessage: t('users.create.success', {
      fallback: 'User created successfully',
    }),
    invalidateQueries: [userKeys.lists()],
    onSuccess: (data) => {
      // Prime detail cache
      const validated = userDTOSchema.parse(data);
      queryClient.setQueryData(userKeys.detail(validated.id), validated);
    },
  })();
}
```

---

## Form Implementation Patterns

### Field Primitives (MANDATORY)

**Rule:** ALWAYS use Field primitives for ALL form inputs.

```typescript
import { Field, FieldLabel, FieldContent, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

// ✅ CORRECT
<Field>
  <FieldLabel htmlFor="email">{t('users.form.email')}</FieldLabel>
  <FieldContent>
    <Input
      id="email"
      type="email"
      {...register('email')}
      aria-describedby="email-error"
    />
    <FieldError id="email-error">
      {errors.email?.message}
    </FieldError>
  </FieldContent>
</Field>

// ❌ WRONG - No Field primitives
<div>
  <label>{t('users.form.email')}</label>
  <input {...register('email')} />
  {errors.email && <span>{errors.email.message}</span>}
</div>
```

---

### Complete Form Pattern

```typescript
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { userSchema, type TUserFormData } from './schemas/userSchema';
import { useCreateUser } from './hooks/useCreateUser';

interface IUserFormProps {
  onSuccess?: () => void;
  initialData?: TUserFormData;
}

export function UserForm({ onSuccess, initialData }: IUserFormProps) {
  const t = useTranslations('users.form');
  const createUser = useCreateUser();

  const form = useForm<TUserFormData>({
    resolver: zodResolver(userSchema) as Resolver<TUserFormData>,
    defaultValues: initialData || {
      name: '',
      email: '',
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createUser.mutateAsync(data);
      onSuccess?.();
    } catch (error) {
      // Error handling is done in mutation
      console.error('Form submission failed:', error);
    }
  });

  const isSubmitting = createUser.isPending;

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="name">{t('name')}</FieldLabel>
              <FieldContent>
                <Input
                  id="name"
                  placeholder={t('namePlaceholder')}
                  disabled={isSubmitting}
                  aria-invalid={!!fieldState.error}
                  aria-describedby={fieldState.error ? 'name-error' : undefined}
                  {...field}
                />
                <FieldError id="name-error">
                  {fieldState.error?.message}
                </FieldError>
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor="email">{t('email')}</FieldLabel>
              <FieldContent>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  disabled={isSubmitting}
                  aria-invalid={!!fieldState.error}
                  aria-describedby={fieldState.error ? 'email-error' : undefined}
                  {...field}
                />
                <FieldError id="email-error">
                  {fieldState.error?.message}
                </FieldError>
              </FieldContent>
            </Field>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? t('submitting') : t('submit')}
        </Button>
      </form>
    </Form>
  );
}
```

**Form Checklist:**
- [ ] Use `'use client'` directive
- [ ] Use Controller for all fields
- [ ] Field primitives for structure
- [ ] aria-invalid on inputs
- [ ] aria-describedby linking errors
- [ ] Disable fields during submission
- [ ] Try-catch in submit handler
- [ ] i18n for all text

---

### Phone Field (Uzbekistan Only)

**Rule:** ALWAYS use the shared PhoneField component for phone inputs.

```typescript
import { PhoneField } from '@/components/shared/form/PhoneField';

<PhoneField
  control={form.control}
  name="phone"
  label={t('auth.phone.label')}
  placeholder={t('auth.phone.placeholderUz')}
  disabled={isSubmitting}
/>
```

**Behavior:**
- Display mask: `+998 XX XXX XX XX`
- Form state: `+998XXXXXXXXX` (E.164 format)
- Non-interactive prefix: `🇺🇿 +998`
- Validates Uzbekistan phone format

---

## Error Handling Standards

### Pattern 1: Mutation Errors (Automatic)

```typescript
// Error toast is automatically shown by createMutation
const createUser = createMutation({
  mutationFn: UserService.createUser,
  successMessage: t('users.create.success'),
  // onError is optional - only add if custom logic needed
});
```

---

### Pattern 2: Query Errors (Manual)

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: UserService.getUsers,
});

if (error) {
  return (
    <ContentPlaceholder
      icon={AlertTriangle}
      title={t('common.error.title')}
      description={t('common.error.description')}
      actions={[
        {
          label: t('common.retry'),
          onClick: () => refetch(),
        },
      ]}
    />
  );
}
```

---

### Pattern 3: Try-Catch in Handlers

```typescript
// ✅ ALWAYS use try-catch for async handlers
const handleSubmit = async (data: FormData) => {
  try {
    await mutation.mutateAsync(data);
    onSuccess?.();
  } catch (error) {
    // Error is already handled by mutation
    // Only add custom logic if needed
    console.error('Submit failed:', error);
  }
};
```

---

### Pattern 4: Form Field Errors

```typescript
// Errors are automatically displayed via FieldError
<Controller
  name="email"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field>
      <FieldLabel htmlFor="email">{t('form.email')}</FieldLabel>
      <FieldContent>
        <Input
          id="email"
          aria-invalid={!!fieldState.error}
          aria-describedby={fieldState.error ? 'email-error' : undefined}
          {...field}
        />
        <FieldError id="email-error">
          {fieldState.error?.message}
        </FieldError>
      </FieldContent>
    </Field>
  )}
/>
```

---

## i18n Best Practices

### Key Naming Convention

**Pattern:** `{feature}.{context}.{key}`

```json
{
  "users": {
    "title": "Users",
    "form": {
      "name": "Full Name",
      "namePlaceholder": "Enter full name...",
      "email": "Email Address",
      "submit": "Save User",
      "submitting": "Saving..."
    },
    "validation": {
      "nameMin": "Name must be at least 2 characters",
      "emailInvalid": "Please enter a valid email"
    },
    "create": {
      "success": "User created successfully",
      "error": "Failed to create user"
    },
    "empty": {
      "title": "No users found",
      "description": "Create your first user to get started"
    }
  }
}
```

---

### Usage Patterns

**Client Components:**
```typescript
import { useTranslations } from 'next-intl';

export function UserForm() {
  const t = useTranslations('users.form');
  
  return (
    <Field>
      <FieldLabel htmlFor="name">{t('name')}</FieldLabel>
      {/* ... */}
    </Field>
  );
}
```

**Server Components:**
```typescript
import { getTranslations } from 'next-intl/server';

export default async function UsersPage() {
  const t = await getTranslations('users');
  
  return <h1>{t('title')}</h1>;
}
```

**With Fallbacks:**
```typescript
// Always provide fallback for safety
<Button>{t('common.save', { fallback: 'Save' })}</Button>
```

**With Variables:**
```typescript
// Use interpolation for dynamic content
<p>{t('validation.nameMin', { count: 2 })}</p>
```

---

### Translation File Checklist

**CRITICAL:** When adding ANY new feature, update ALL THREE locale files:

- [ ] `messages/en.json` (English)
- [ ] `messages/ru.json` (Russian)
- [ ] `messages/uz.json` (Uzbek)

**If you only speak English:**
1. Add English translations
2. Use Google Translate for Russian/Uzbek
3. Add comment: `// TODO: Professional translation needed`
4. Human developer will review later

---

## Testing Requirements

### Unit Tests (Services)

```typescript
// src/services/__tests__/userService.test.ts
import { UserService } from '../userService';
import { apiClient } from '@/lib/api';

jest.mock('@/lib/api');

describe('UserService', () => {
  it('fetches users successfully', async () => {
    const mockResponse = {
      data: { content: [], totalElements: 0 },
      errors: [],
    };

    (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

    const result = await UserService.getUsers({});

    expect(apiClient.get).toHaveBeenCalledWith(
      '/users',
      expect.objectContaining({
        query: expect.any(Object),
      })
    );
    expect(result).toEqual(mockResponse.data);
  });
});
```

---

### Integration Tests (Hooks)

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUsers } from '../useUsers';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useUsers', () => {
  it('fetches users successfully', async () => {
    const { result } = renderHook(() => useUsers({}), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
```

---

### Component Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { UserForm } from '../UserForm';

describe('UserForm', () => {
  it('validates required fields', async () => {
    render(<UserForm onSubmit={jest.fn()} />);

    fireEvent.submit(screen.getByRole('button', { name: /submit/i }));

    await screen.findByText(/required/i);
  });
});
```

---

## AI-Specific Guidelines

### Decision Trees for AI Agents

#### When to Create a New Service File?

```
Is it a new backend endpoint?
├─ YES → Create new service
└─ NO → Does it fit existing service?
   ├─ YES → Add method to existing service
   └─ NO → Create new service
```

#### When to Use Container/Presentational Pattern?

```
Does component fetch data?
├─ YES → Create Container + Presentational
└─ NO → Is it reusable across contexts?
   ├─ YES → Create Presentational only
   └─ NO → Create single component
```

#### When to Use Optimistic Updates?

```
Is the operation destructive (delete)?
├─ YES → Use optimistic updates
└─ NO → Is immediate feedback critical?
   ├─ YES → Use optimistic updates
   └─ NO → Use standard mutations
```

---

### Code Generation Rules

**1. Always start with types:**
```typescript
// Step 1: Define types
export type TUser = {
  id: string;
  name: string;
  email: string;
};

// Step 2: Define schemas
export const userSchema = z.object({
  name: z.string().min(2, 'users.validation.nameMin'),
  email: z.string().email('users.validation.emailInvalid'),
});

// Step 3: Create service
// Step 4: Create hooks
// Step 5: Create components
```

**2. Never skip validation:**
```typescript
// ✅ ALWAYS validate API responses
static async getUser(id: string): Promise<TUser> {
  const response = await apiClient.get(`/users/${id}`);
  const data = extractApiData(response);
  return userDTOSchema.parse(data); // ← MANDATORY
}
```

**3. Always use i18n:**
```typescript
// ❌ NEVER hardcode strings
<Button>Save</Button>

// ✅ ALWAYS use translations
const t = useTranslations('common');
<Button>{t('save', { fallback: 'Save' })}</Button>
```

**4. Always handle loading/error states:**
```typescript
// ✅ ALWAYS handle all states
const { data, isLoading, error } = useQuery({...});

if (isLoading) return <FullPageLoading text={t('loading')} />;
if (error) return <ErrorDisplay error={error} />;
return <Component data={data} />;
```

---

### AI Agent Workflow Reference

For detailed step-by-step workflows, see the **AI Implementation Workflow Guide** which covers:

1. **Adding a New Entity (CRUD)** - Complete walkthrough with all files
2. **Adding a New Form** - Form patterns and validation
3. **Adding a New Page** - Routing and layout
4. **Adding a New Question Type** - Complex discriminated union pattern
5. **Adding API Integration** - Service layer and hooks
6. **Error Handling Workflows** - All error patterns
7. **Testing Workflows** - Unit, integration, and component tests

**Time Estimates:**
- Simple CRUD entity: 90-120 minutes
- Complex form: 120-180 minutes
- New page with filters: 60-90 minutes
- New question type: 120-150 minutes

---

## Git & Branching

- Use descriptive commit messages following conventional commits:
    - `feat:` New feature
    - `fix:` Bug fix
    - `docs:` Documentation changes
    - `style:` Code style changes (formatting)
    - `refactor:` Code refactoring
    - `test:` Adding/updating tests
    - `chore:` Maintenance tasks

**Examples:**
```
feat: add user profile page
fix: resolve phone validation for Uzbekistan numbers
docs: update API integration guidelines
refactor: extract phone field component
```

- Create feature branches for new work
- Open pull requests for code review before merging

---

## Backend & MCP Integration

- Use **MCP Backend Filesystem server** for business logic/codebase access
- Use **MCP Swagger server** for API documentation/specs
- Generate TypeScript types from Swagger specs for type safety
- Design service layer to match backend contracts
- Implement robust error handling based on API patterns

---

## Accessibility & Performance

### Accessibility Requirements

**Every form input MUST have:**
- [ ] Associated label with `htmlFor`/`id`
- [ ] `aria-invalid` when error present
- [ ] `aria-describedby` linking to error message
- [ ] Keyboard navigation support

**Example:**
```typescript
<Field>
  <FieldLabel htmlFor="email">{t('form.email')}</FieldLabel>
  <FieldContent>
    <Input
      id="email"
      aria-invalid={!!errors.email}
      aria-describedby={errors.email ? 'email-error' : undefined}
      {...register('email')}
    />
    <FieldError id="email-error">
      {errors.email?.message}
    </FieldError>
  </FieldContent>
</Field>
```

### Performance Guidelines

- Use Next.js `Image` component for images
- Implement code splitting with dynamic imports
- Optimize bundle size regularly
- Use React.memo for expensive components
- Implement virtual scrolling for large lists

---

## Logging & Analytics

- Use Sentry or similar for error monitoring
- Never log sensitive user information
- Use structured logging with context
- Log API errors with request/response details

---

## Security Best Practices

### Input Validation
- Always validate on both client and server
- Use Zod for schema validation
- Sanitize user inputs (especially rich text)

### Authentication
- Use NextAuth.js v5 for authentication
- Store JWT tokens securely
- Implement refresh token rotation
- Never expose secrets in client code

### API Security
- Implement CSRF protection
- Use Content Security Policy headers
- Rate limit API requests
- Validate all API responses with Zod

---

## Common Mistakes to Avoid

### ❌ Mistake #1: Not Using Field Primitives
```typescript
// ❌ WRONG
<div>
  <label>Name</label>
  <input {...register('name')} />
</div>

// ✅ CORRECT
<Field>
  <FieldLabel htmlFor="name">{t('form.name')}</FieldLabel>
  <FieldContent>
    <Input id="name" {...register('name')} />
  </FieldContent>
</Field>
```

### ❌ Mistake #2: Mixing Data Fetching with Presentation
```typescript
// ❌ WRONG
export function UserList() {
  const [users, setUsers] = useState([]);
  useEffect(() => { /* fetch */ }, []);
  return <div>{users.map(/* ... */)}</div>;
}

// ✅ CORRECT
export function UserList({ users }: { users: TUser[] }) {
  return <div>{users.map(/* ... */)}</div>;
}

export function UserListContainer() {
  const { data: users } = useUsers();
  return <UserList users={users || []} />;
}
```

### ❌ Mistake #3: Hardcoded Strings
```typescript
// ❌ WRONG
<Button>Submit</Button>

// ✅ CORRECT
<Button>{t('form.submit')}</Button>
```

### ❌ Mistake #4: Not Validating API Responses
```typescript
// ❌ WRONG
static async getUser(id: string) {
  const response = await apiClient.get(`/users/${id}`);
  return extractApiData(response); // Unknown shape!
}

// ✅ CORRECT
static async getUser(id: string): Promise<TUser> {
  const response = await apiClient.get(`/users/${id}`);
  const data = extractApiData(response);
  return userDTOSchema.parse(data); // Validated!
}
```

### ❌ Mistake #5: Missing AbortSignal
```typescript
// ❌ WRONG
static async getUsers(filter: TUserFilter) {
  return await apiClient.get('/users');
}

// ✅ CORRECT
static async getUsers(
  filter: TUserFilter,
  signal?: AbortSignal
): Promise<IPageableList<TUser>> {
  return await apiClient.get('/users', {
    signal,
    query: filter,
  });
}
```

### ❌ Mistake #6: Not Invalidating Queries
```typescript
// ❌ WRONG
const createUser = useMutation({
  mutationFn: UserService.createUser,
  // No invalidation!
});

// ✅ CORRECT
const createUser = createMutation({
  mutationFn: UserService.createUser,
  invalidateQueries: [userKeys.lists()],
});
```

---

## Quick Reference

### Import Patterns

```typescript
// Types & Validation
import { z } from 'zod';
import type { TUser } from './types/user';

// Forms
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Field, FieldLabel, FieldContent, FieldError } from '@/components/ui/field';

// Data Fetching
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// i18n
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server'; // Server components

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FullPageLoading } from '@/components/shared/ui/FullPageLoading';
import { PhoneField } from '@/components/shared/form/PhoneField';
```

---

### File Creation Checklist

When creating a new entity:

1. **Types** (`types/[entity].ts`)
    - [ ] DTO type
    - [ ] Filter type
    - [ ] Create request type
    - [ ] Update request type

2. **Schemas** (`schemas/[entity]Schema.ts`)
    - [ ] DTO schema
    - [ ] Form schema
    - [ ] Pageable response schema
    - [ ] Type exports

3. **Service** (`services/[entity]Service.ts`)
    - [ ] Static methods
    - [ ] AbortSignal for GET
    - [ ] Zod validation
    - [ ] JSDoc comments

4. **Query Keys** (`keys.ts`)
    - [ ] Hierarchical structure
    - [ ] List and detail keys

5. **Hooks** (`hooks/`)
    - [ ] Query hooks
    - [ ] Mutation hooks
    - [ ] Barrel export

6. **i18n** (`messages/*.json`)
    - [ ] Add to en.json
    - [ ] Add to ru.json
    - [ ] Add to uz.json

7. **Components** (`components/`)
    - [ ] Presentational
    - [ ] Container
    - [ ] Forms

---

## Final Checklist

Before considering any feature complete:

### Code Quality
- [ ] TypeScript compiles without errors
- [ ] ESLint passes without warnings
- [ ] All types explicitly defined (no `any`)
- [ ] Consistent naming conventions

### Architecture
- [ ] Container/Presentational pattern followed
- [ ] Service layer for all API calls
- [ ] Query keys properly structured
- [ ] Mutations invalidate correct queries

### Forms
- [ ] Field primitives used correctly
- [ ] Zod schema validation
- [ ] All fields have proper accessibility
- [ ] Loading states during submission

### i18n
- [ ] ALL user-facing text uses i18n
- [ ] Keys added to all 3 locale files
- [ ] Fallbacks provided
- [ ] No hardcoded strings

### Error Handling
- [ ] Query errors handled
- [ ] Mutation errors handled
- [ ] Loading states shown
- [ ] Empty states shown

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Proper ARIA attributes
- [ ] Color contrast sufficient

### Testing
- [ ] Manual testing passed
- [ ] Edge cases tested
- [ ] Responsive design verified
- [ ] Multiple browsers checked

---

## Resources

- **AI Workflow Guide**: Step-by-step implementation instructions
- **UI Primitives Cookbook**: Component patterns and examples
- **Next.js Docs**: https://nextjs.org/docs
- **TanStack Query**: https://tanstack.com/query
- **shadcn/ui**: https://ui.shadcn.com
- **Zod**: https://zod.dev

---

**Last Updated:** 2025-01-XX  
**Version:** 2.0 (AI-Enhanced)