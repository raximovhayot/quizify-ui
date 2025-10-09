# Atomic Design Methodology for Quizify UI

Updated: 2025-10-08

This document outlines how we apply Atomic Design in the Quizify UI (Next.js 15, React 19, TypeScript 5).

## Overview

- Atoms: Small, reusable view primitives (e.g., `List`, `ListItem`, icon/text helpers). Should be stateless, presentational only.
- Molecules: Combinations of atoms that form a meaningful unit (e.g., `EmptyState`, `IconHeading`). Minimal UI state only.
- Organisms: Composite sections composed of molecules and atoms (e.g., `Header`, `CardList`). No business logic.

## Directory Structure

```
src/
  components/
    atomic/
      atoms/
        List.tsx
        ListItem.tsx
        index.ts
      molecules/
        IconHeading.tsx
        index.ts
      organisms/
        index.ts
      index.ts
```

Keep shadcn/ui components in `src/components/ui` and do not rename them. Do not re-export them; import from their source modules directly (`@/components/ui/*`).

## Usage

```tsx
import { List, ListItem } from '@/components/atomic/atoms';
import { EmptyState } from '@/components/shared/ui/EmptyState';

<List>
  <ListItem>Item A</ListItem>
</List>;
```

## Example Refactor

`RegistrationSimpleList` now composes `List` and `ListItem` from `atomic`, and `EmptyState` from `@/components/shared/ui/EmptyState`, without changing its public API or location. This allows gradual migration while avoiding re-exports.

## Guidelines

- TypeScript: strict, explicit props; avoid `any`.
- i18n: all visible strings translatable via `next-intl` at feature level; atoms/molecules accept strings as props and do not embed text.
- Accessibility: use semantic elements (`ul`, `li`, headings); add ARIA attributes when needed.
- Styling: Tailwind utility classes; keep primitives minimal.
- Testing: write small tests for atoms/molecules as they’re added; snapshot acceptable for stable UI.

## Migration Plan

1. New components must be added under `atomic` when they are reusable UI primitives.
2. Identify duplicated UI (lists, headings, empty states) and migrate to atoms/molecules first.
3. Gradually replace duplicated presentational UI with `atomic` atoms/molecules where appropriate. Import shadcn/shared UI directly from their source modules (no re-exports).
4. Keep feature containers smart; presentational parts should be atomic-driven.

## Notes

- This is a non-breaking introduction; existing imports continue to work.
- Prefer barrels for imports: `@/components/atomic/atoms`, `@/components/atomic/molecules`.

## Molecules quick usage

### KeyValue

Semantic key/value display using `dl`/`dt`/`dd`. Supports vertical (default) and horizontal layouts.

```tsx
import { KeyValue } from '@/components/atomic/molecules';

// Vertical (stacked)
<KeyValue items={[
  { key: 'Title', value: 'Intro to Algebra' },
  { key: 'Questions', value: 15 },
]} />

// Horizontal with subtle keys and small text
<KeyValue
  layout="horizontal"
  size="sm"
  mutedKeys
  items={[
    { key: 'Due', value: 'Oct 12, 10:00' },
    { key: 'Attempts', value: '2 of 3' },
  ]}
/>
```

### UserChip

Avatar + name + optional subtitle/action.

```tsx
import { UserChip } from '@/components/atomic/molecules';

<UserChip
  name="Jane Doe"
  subtitle="Student"
  // action={<Button variant="outline" size="sm">View</Button>}
/>;
```

### ListSkeleton

Mirrors `ListItem` look to keep loading and loaded states visually consistent.

```tsx
import { ListSkeleton } from '@/components/atomic/molecules';

// 4 rows, dense spacing, no trailing action placeholders
<ListSkeleton rows={4} dense showAction={false} />

// Back-compat alias
<ListSkeleton count={2} />
```

### Using shadcn primitives directly (no re-exports)

Import shadcn/ui primitives from their source modules.

```tsx
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

<Button size="sm" variant="outline">Action</Button>
<Skeleton className="h-4 w-32" />
```

Policy: Do not re-export shadcn or shared UI components from `atomic`.
