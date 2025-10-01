# Reusable UI Components

This directory contains reusable UI components for common patterns throughout the application.

## Components

### DataCard

A standardized card layout for displaying data with loading states, error handling, and optional actions.

**Props:**

- `title` (string, required): The card title
- `icon` (ReactNode, optional): Icon to display next to title
- `isLoading` (boolean, optional): Show loading spinner (default: false)
- `error` (string, optional): Error message to display
- `actions` (ReactNode, optional): Action buttons in header
- `children` (ReactNode, required): Card content
- `headerClassName` (string, optional): Custom header className

**Example:**

```tsx
import { BookOpen } from 'lucide-react';

import { DataCard } from '@/components/shared/ui/DataCard';

<DataCard
  title="Recent Quizzes"
  icon={<BookOpen className="h-5 w-5" />}
  isLoading={isLoading}
  error={error?.message}
  actions={<RefreshButton />}
>
  <QuizList items={quizzes} />
</DataCard>;
```

**Usage:**

- Quiz lists
- History lists
- Analytics cards
- Any data display with loading/error states

**Benefits:**

- Consistent loading indicator placement
- Standardized error display
- Unified card header with icons and actions
- Reduces 20+ lines per data card

---

### EmptyState (Enhanced)

An enhanced empty state component with multiple variants for different contexts.

**Props:**

- `icon` (JSX.Element, optional): Custom icon (auto-selected based on variant)
- `message` (string, required): Main message
- `description` (string, optional): Additional description
- `action` (ReactNode, optional): Action button or link
- `variant` ('default' | 'large' | 'inline', optional): Display variant (default: 'default')

**Variants:**

1. **Inline** - Compact single-line display
2. **Default** - Centered with medium spacing
3. **Large** - Full centered layout with prominent icon

**Examples:**

```tsx
import { EmptyState } from '@/components/shared/ui/EmptyState';
import { Inbox } from 'lucide-react';

// Inline variant (original pattern)
<EmptyState
  variant="inline"
  message="No quizzes found"
/>

// Default variant
<EmptyState
  message="No quizzes yet"
  description="Create your first quiz to get started"
  action={<Button>Create Quiz</Button>}
/>

// Large variant for prominent empty states
<EmptyState
  variant="large"
  icon={<Inbox />}
  message="Your inbox is empty"
  description="New notifications will appear here"
  action={<Button>Refresh</Button>}
/>
```

**Usage:**

- Empty quiz lists
- No search results
- Empty history
- Placeholder content

**Benefits:**

- Three variants for different contexts
- Optional action buttons
- Consistent empty state styling
- Auto-selected default icons

---

## Best Practices

1. **Use DataCard for data lists**: Provides consistent loading and error states
2. **Choose appropriate EmptyState variant**:
   - `inline` for compact lists or tables
   - `default` for most cases
   - `large` for prominent/full-page empty states
3. **Always provide meaningful messages**: Help users understand what's empty and why
4. **Add actions when appropriate**: Guide users on what to do next

## Migration Guide

### DataCard Migration

**Before:**

```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between gap-4">
    <div className="flex items-center gap-2 font-medium">
      <BookOpen />
      <span>Recent Quizzes</span>
    </div>
    <div className="flex items-center gap-2">
      {actions}
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
    </div>
  </CardHeader>
  <CardContent>
    {error ? <div className="text-destructive text-sm">{error}</div> : children}
  </CardContent>
</Card>
```

**After:**

```tsx
<DataCard
  title="Recent Quizzes"
  icon={<BookOpen />}
  isLoading={isLoading}
  error={error}
  actions={actions}
>
  {children}
</DataCard>
```

**Result**: Reduced from ~25 lines to ~10 lines (60% reduction)

---

### EmptyState Migration

**Before:**

```tsx
<div className="flex items-center gap-2 text-sm text-muted-foreground">
  <AlertCircle className="h-5 w-5" />
  <span>No quizzes found</span>
</div>
```

**After:**

```tsx
<EmptyState variant="inline" message="No quizzes found" />
```

For more prominent empty states:

```tsx
<EmptyState
  variant="large"
  icon={<Inbox />}
  message="No quizzes yet"
  description="Create your first quiz to get started"
  action={<Button>Create Quiz</Button>}
/>
```

**Result**: Same code for inline, but new variants provide more options
