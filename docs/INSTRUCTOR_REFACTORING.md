# Instructor Section Refactoring Guide

This document describes the refactored instructor section patterns and best practices.

## Architecture Overview

The instructor section now follows a consistent architecture pattern across all pages:

```
┌─────────────────────────────────────────┐
│  App Router Page (Next.js)              │
│  - Minimal wrapper                      │
│  - Imports feature component            │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Feature Page Component (Container)     │
│  - URL-based state management           │
│  - Data fetching with TanStack Query    │
│  - Error handling                       │
│  - Passes data to content component     │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Content Component (Presentational)     │
│  - Pure presentation logic              │
│  - No data fetching                     │
│  - Receives all data/handlers as props  │
│  - Renders UI components                │
└─────────────────────────────────────────┘
```

## Key Patterns

### 1. URL-Based State Management

**Why**: Provides better UX with shareable URLs, back button support, and state persistence.

**Implementation**: Use the shared `useUrlFilter` hook:

```tsx
import { useUrlFilter } from '@/components/shared/hooks/useUrlFilter';

const { filter, setPage, setSize, setSearch, updateFilter } =
  useUrlFilter<QuizFilter>({
    defaultSize: 10,
    parseFilter: (params) => ({
      status: params.get('status') as QuizStatus | undefined,
    }),
  });
```

**Features**:

- Automatic URL synchronization
- Type-safe filter management
- Built-in pagination and search
- Custom filter parsing support
- Automatic page reset on filter changes

### 2. Container/Presentational Pattern

**Container Component** (`InstructorQuizzesPage.tsx`):

```tsx
export function InstructorQuizzesPage() {
  const { filter, setPage, setSize, setSearch } = useUrlFilter<QuizFilter>();
  const quizzesQuery = useQuizzes(filter);
  const deleteQuiz = useDeleteQuiz();

  // Error handling
  if (quizzesQuery.error) return <ErrorDisplay />;

  // Pass everything to presentational component
  return <QuizzesContent data={...} handlers={...} />;
}
```

**Presentational Component** (`QuizzesContent.tsx`):

```tsx
export function QuizzesContent({
  data,
  isLoading,
  filter,
  onSearch,
  onPageChange,
  // ... other props
}) {
  // Only UI logic and rendering
  return (
    <div>
      <Filters />
      <DataList />
      <Pagination />
    </div>
  );
}
```

**Benefits**:

- Clear separation of concerns
- Easier testing
- Reusable presentational components
- Better code organization

### 3. Consistent Filter UI

All list pages follow the same filter structure:

```tsx
<Card className="p-4">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
    {/* Search input */}
    <form onSubmit={handleSearchSubmit} className="flex-1">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
    </form>

    {/* Status filter */}
    <Select
      value={filter.status || 'all'}
      onValueChange={handleStatusFilterChange}
    >
      <SelectTrigger className="w-[160px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Status</SelectItem>
        {/* ... other options */}
      </SelectContent>
    </Select>
  </div>
</Card>
```

### 4. Loading States

Use skeleton components for better perceived performance:

```tsx
if (isLoading && !data) {
  return <QuizListSkeleton />;
}
```

Each feature has its own skeleton component matching the actual content layout.

### 5. Results Summary

Provide clear feedback about current view:

```tsx
<div className="flex items-center justify-between">
  <p className="text-sm text-muted-foreground">
    {t('summary', {
      fallback: 'Showing {start} to {end} of {total} items',
      start: totalElements === 0 ? 0 : currentPage * pageSize + 1,
      end: Math.min((currentPage + 1) * pageSize, totalElements),
      total: totalElements,
    })}
  </p>

  {/* Page size selector */}
  <Select value={pageSize.toString()} onValueChange={onPageSizeChange}>
    <SelectTrigger className="w-[100px]">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="10">10</SelectItem>
      <SelectItem value="20">20</SelectItem>
      <SelectItem value="50">50</SelectItem>
    </SelectContent>
  </Select>
</div>
```

## File Structure

```
src/components/features/instructor/
├── quiz/
│   ├── InstructorQuizzesPage.tsx       # Container component
│   ├── components/
│   │   ├── QuizzesContent.tsx          # Presentational component
│   │   ├── QuizTable.tsx               # Data display component
│   │   └── QuizListSkeleton.tsx        # Loading skeleton
│   ├── hooks/
│   │   ├── useQuizzes.ts               # Data fetching hook
│   │   ├── useDeleteQuiz.ts            # Mutation hook
│   │   └── useUpdateQuizStatus.ts      # Mutation hook
│   ├── services/
│   │   └── quizService.ts              # API service layer
│   └── types/
│       └── quiz.ts                     # Type definitions
│
├── analytics/
│   ├── InstructorAnalyticsPage.tsx     # Container component
│   ├── components/
│   │   ├── AnalyticsContent.tsx        # Presentational component
│   │   ├── AssignmentCard.tsx          # Card component
│   │   └── AnalyticsListSkeleton.tsx   # Loading skeleton
│   ├── hooks/
│   │   └── useAssignments.ts           # Data fetching hook
│   ├── services/
│   │   └── assignmentService.ts        # API service layer
│   └── types/
│       └── assignment.ts               # Type definitions
│
└── routes.ts                           # Route constants
```

## Shared Components Used

- `AppPagination` - Consistent pagination across pages
- `ErrorDisplay` - Standard error state rendering
- `EmptyState` - Empty state rendering
- `DataCard` - Card component with loading states
- `SkeletonCard` - Reusable skeleton component

## Shared Hooks

- `useUrlFilter<T>` - URL-based filter management
- Query hooks from TanStack Query
- Mutation hooks for data updates

## Best Practices

### 1. Always Use URL State for Filters

❌ **Don't**:

```tsx
const [page, setPage] = useState(0);
const [search, setSearch] = useState('');
```

✅ **Do**:

```tsx
const { filter, setPage, setSearch } = useUrlFilter<QuizFilter>();
```

### 2. Separate Container and Presentation

❌ **Don't**: Mix data fetching and UI in one component

✅ **Do**: Split into container (data) and content (UI) components

### 3. Use Proper Loading States

❌ **Don't**:

```tsx
if (isLoading) return <div>Loading...</div>;
```

✅ **Do**:

```tsx
if (isLoading && !data) return <QuizListSkeleton />;
```

### 4. Consistent Error Handling

Always use `ErrorDisplay` component for errors:

```tsx
if (error) {
  return (
    <div className="p-6">
      <ErrorDisplay
        error={error}
        onRetry={() => refetch()}
      />
    </div>
  );
}
```

### 5. Debounce Search Input

Use local state for input, sync with debounce:

```tsx
const [searchQuery, setSearchQuery] = useState(filter.search || '');

useEffect(() => {
  const trimmed = (searchQuery || '').trim();
  if (trimmed === (filter.search || '')) return;
  const id = setTimeout(() => onSearch(searchQuery), 400);
  return () => clearTimeout(id);
}, [searchQuery, filter.search, onSearch]);
```

### 6. Internationalization

All user-facing text must use `next-intl`:

```tsx
const t = useTranslations();

<h1>{t('instructor.quiz.list.title', { fallback: 'Your Quizzes' })}</h1>;
```

## Adding a New List Page

1. **Create the container component**:

   ```tsx
   export function InstructorNewPage() {
     const { filter, setPage, setSearch } = useUrlFilter<YourFilter>();
     const query = useYourData(filter);

     if (query.error) return <ErrorDisplay />;
     return <YourContent {...props} />;
   }
   ```

2. **Create the content component**:

   ```tsx
   export function YourContent({ data, isLoading, filter, handlers }) {
     if (isLoading && !data) return <YourSkeleton />;

     return (
       <div className="space-y-6">
         <Header />
         <Filters />
         <ResultsSummary />
         <DataList />
         <Pagination />
       </div>
     );
   }
   ```

3. **Create supporting components**:
   - `YourSkeleton.tsx` - Loading skeleton
   - `YourCard.tsx` or `YourTable.tsx` - Data display
   - Hook for data fetching
   - Service for API calls
   - Types definition

4. **Wire up the app router page**:
   ```tsx
   export default function Page() {
     return <InstructorNewPage />;
   }
   ```

## Migration Checklist

When refactoring an existing page:

- [ ] Extract filter state to `useUrlFilter` hook
- [ ] Split into container and content components
- [ ] Add proper loading skeleton
- [ ] Use `ErrorDisplay` for errors
- [ ] Add results summary with page size selector
- [ ] Implement debounced search
- [ ] Add proper i18n keys
- [ ] Test pagination, filtering, and search
- [ ] Remove old unused components
- [ ] Update documentation

## Testing

Test the following for each list page:

- [ ] Initial load shows skeleton
- [ ] Data displays correctly
- [ ] Search filters results (debounced)
- [ ] Status filter works
- [ ] Pagination works
- [ ] Page size selector works
- [ ] URL updates when filters change
- [ ] Back button works correctly
- [ ] Error states display properly
- [ ] Empty states display properly
- [ ] All text is translatable

## Future Enhancements

Potential improvements for future iterations:

1. **Advanced Filters**: Date ranges, multi-select, etc.
2. **Sort Options**: Sortable columns in tables
3. **Bulk Actions**: Select multiple items for batch operations
4. **Export**: Download filtered results as CSV/PDF
5. **Saved Views**: Save filter combinations
6. **Real-time Updates**: WebSocket or polling for live data
