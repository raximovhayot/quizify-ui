# Quiz View Page Revamp - Code Examples

## Component Structure

### Before

```
QuizViewPage
├── QuizViewHeader (with actions inline)
├── Mobile Section (sm:hidden)
│   ├── QuizViewDetails
│   ├── Actions (inline buttons)
│   └── QuizViewConfiguration
├── Desktop Section (hidden sm:block)
│   ├── QuizViewDetails
│   └── QuizViewConfiguration
└── QuizViewQuestions
```

### After

```
QuizViewPage (with container + grid)
├── QuizViewHeader (simplified, no actions)
└── Grid Layout (grid-cols-1 lg:grid-cols-3)
    ├── Main Column (lg:col-span-2)
    │   ├── QuizViewDetails (card)
    │   └── QuizViewQuestions (card)
    └── Sidebar Column (lg:col-span-1)
        ├── QuizViewActions (card) [NEW]
        └── QuizViewConfiguration (card)
```

## Code Comparison

### QuizViewPage.tsx

#### Before (205 lines)

```tsx
export function QuizViewPage({ quizId }: QuizViewPageProps) {
  const t = useTranslations();
  const router = useRouter();
  const { data: quiz, isLoading, error } = useQuiz(quizId);
  const updateStatus = useUpdateQuizStatus();

  // ... error handling ...

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full space-y-8">
        <div className="space-y-6">
          <QuizViewHeader quiz={quiz} />

          {/* Mobile arrangement */}
          <div className="sm:hidden space-y-3">
            <QuizViewDetails quiz={quiz} />
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => router.push(ROUTES_APP.quizzes.edit(quiz.id))}>
                <Edit className="h-4 w-4" />
                {t('common.edit')}
              </Button>
              {quiz.status === QuizStatus.DRAFT ? (
                <Button onClick={() => updateStatus.mutate({ ... })}>
                  <CheckCircle2 className="h-4 w-4" />
                  {t('common.publish')}
                </Button>
              ) : (
                <Button onClick={() => console.log('Starting quiz')}>
                  <Play className="h-4 w-4" />
                  {t('common.start')}
                </Button>
              )}
            </div>
            <QuizViewConfiguration quiz={quiz} />
          </div>

          {/* Desktop arrangement */}
          <div className="hidden sm:block space-y-6">
            <QuizViewDetails quiz={quiz} />
            <QuizViewConfiguration quiz={quiz} />
          </div>
        </div>

        <div className="w-full">
          <div className="space-y-6">
            <QuizViewQuestions quiz={quiz} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### After (78 lines)

```tsx
export function QuizViewPage({ quizId }: QuizViewPageProps) {
  const t = useTranslations();
  const router = useRouter();
  const { data: quiz, isLoading, error } = useQuiz(quizId);

  if (isLoading) {
    return <QuizViewSkeleton />;
  }

  if (error || !quiz) {
    return <ContentPlaceholder ... />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
        <div className="space-y-6 sm:space-y-8">
          {/* Header with back button and status */}
          <QuizViewHeader quiz={quiz} />

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Main column - Details and Questions */}
            <div className="lg:col-span-2 space-y-6">
              <QuizViewDetails quiz={quiz} />
              <QuizViewQuestions quiz={quiz} />
            </div>

            {/* Sidebar column - Configuration and Actions */}
            <div className="lg:col-span-1 space-y-6">
              <QuizViewActions quiz={quiz} />
              <QuizViewConfiguration quiz={quiz} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### QuizViewHeader.tsx

#### Before (125 lines)

```tsx
export function QuizViewHeader({ quiz }: QuizViewHeaderProps) {
  const t = useTranslations();
  const router = useRouter();
  const updateStatus = useUpdateQuizStatus();

  // ... helper functions ...

  return (
    <div className="space-y-4 mb-4">
      <div className="flex items-center gap-3">
        <Button onClick={() => router.push(ROUTES_APP.quizzes.list())}>
          <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
        <Badge variant={getStatusColor(quiz.status)}>
          <StatusIcon className="h-3 w-3 sm:h-4 sm:w-4" />
          {quiz.status === QuizStatus.PUBLISHED ? 'Published' : 'Draft'}
        </Badge>
        <span>ID: {quiz.id}</span>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">{quiz.title}</h1>

        {/* Desktop actions */}
        <div className="hidden sm:flex sm:shrink-0 sm:items-center sm:gap-3">
          <Button onClick={() => router.push(ROUTES_APP.quizzes.edit(quiz.id))}>
            <Edit className="h-4 w-4 md:h-5 md:w-5" />
            {t('common.edit')}
          </Button>
          {quiz.status === QuizStatus.DRAFT ? (
            <Button onClick={() => updateStatus.mutate({ ... })}>
              <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5" />
              {updateStatus.isPending ? 'Updating...' : 'Publish'}
            </Button>
          ) : (
            <Button onClick={() => console.log('Starting quiz')}>
              <Play className="h-4 w-4 md:h-5 md:w-5" />
              {t('common.start')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
```

#### After (77 lines)

```tsx
export function QuizViewHeader({ quiz }: QuizViewHeaderProps) {
  const t = useTranslations();
  const router = useRouter();

  // ... helper functions ...

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(ROUTES_APP.quizzes.list())}
          className="p-2 h-auto shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Badge
          variant={getStatusColor(quiz.status)}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5"
        >
          <StatusIcon className="h-4 w-4" />
          {quiz.status === QuizStatus.PUBLISHED ? 'Published' : 'Draft'}
        </Badge>
        <span className="text-sm text-muted-foreground">ID: {quiz.id}</span>
      </div>
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight break-words">
          {quiz.title || t('instructor.quiz.untitled')}
        </h1>
      </div>
    </div>
  );
}
```

### QuizViewDetails.tsx

#### Before (19 lines)

```tsx
export function QuizViewDetails({ quiz }: QuizViewDetailsProps) {
  if (!quiz.description) {
    return null;
  }

  return (
    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
      {quiz.description}
    </p>
  );
}
```

#### After (43 lines)

```tsx
export function QuizViewDetails({ quiz }: QuizViewDetailsProps) {
  const t = useTranslations();

  if (!quiz.description) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" />
          {t('instructor.quiz.view.details.title', {
            fallback: 'Description',
          })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base leading-relaxed whitespace-pre-wrap">
          {quiz.description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
```

### QuizViewConfiguration.tsx

#### Before (100 lines)

```tsx
export function QuizViewConfiguration({ quiz }: QuizViewConfigurationProps) {
  const t = useTranslations();

  // ... helper functions ...

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
      <div className="flex shrink-0 items-center gap-2 sm:gap-3 px-2.5 py-1.5 rounded-lg bg-muted/50">
        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
        <span className="text-xs sm:text-sm font-medium">Time Limit</span>
        <Badge variant="outline" className="text-[10px] sm:text-xs">
          {formatTimeLimit(quiz.settings.time)}
        </Badge>
      </div>
      {/* ... more inline items ... */}
    </div>
  );
}
```

#### After (124 lines - with Card structure)

```tsx
export function QuizViewConfiguration({ quiz }: QuizViewConfigurationProps) {
  const t = useTranslations();

  // ... helper functions ...

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="h-5 w-5" />
          {t('instructor.quiz.view.configuration.title', {
            fallback: 'Settings',
          })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Time Limit</span>
            </div>
            <Badge variant="outline" className="text-xs font-medium">
              {formatTimeLimit(quiz.settings.time)}
            </Badge>
          </div>
          {/* ... more stacked items ... */}
        </div>
      </CardContent>
    </Card>
  );
}
```

### QuizViewActions.tsx (NEW)

```tsx
export function QuizViewActions({ quiz }: QuizViewActionsProps) {
  const t = useTranslations();
  const router = useRouter();
  const updateStatus = useUpdateQuizStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Actions</CardTitle>
        <CardDescription>Manage your quiz</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Button
            onClick={() => router.push(ROUTES_APP.quizzes.edit(quiz.id))}
            className="w-full flex items-center justify-center gap-2"
            variant="outline"
            size="lg"
          >
            <Edit className="h-4 w-4" />
            {t('common.edit')}
          </Button>
          {quiz.status === QuizStatus.DRAFT ? (
            <Button
              onClick={() => updateStatus.mutate({ ... })}
              disabled={updateStatus.isPending}
              className="w-full flex items-center justify-center gap-2"
              size="lg"
            >
              <CheckCircle2 className="h-4 w-4" />
              {updateStatus.isPending ? 'Updating...' : 'Publish'}
            </Button>
          ) : (
            <Button
              onClick={() => console.log('Starting quiz')}
              className="w-full flex items-center justify-center gap-2"
              size="lg"
            >
              <Play className="h-4 w-4" />
              {t('common.start')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

## Key Improvements Summary

### 1. Reduced Complexity

- QuizViewPage: 205 → 78 lines (-62%)
- QuizViewHeader: 125 → 77 lines (-38%)
- Removed duplicate mobile/desktop logic

### 2. Better Separation of Concerns

- Actions moved to dedicated component
- Each section is a self-contained card
- No inline conditional rendering for layout

### 3. Improved Maintainability

- Single responsive grid layout
- Container-based design
- Consistent card pattern

### 4. Enhanced UX

- Clear visual hierarchy with cards
- Better spacing and touch targets
- Responsive grid adapts automatically
- No horizontal scrolling on mobile

### 5. Better Code Organization

```
Before:
- Mixed concerns (layout + actions + state)
- Duplicate code for mobile/desktop
- Inline button definitions

After:
- Clear separation (layout, actions, display)
- Responsive grid handles all cases
- Reusable action component
```
