# Quick Start Guide - Quiz View Page Updates

## What Changed?

The instructor quiz view page has been completely revamped with a modern, card-based responsive design.

## For Developers

### How to Test

1. **Start the dev server:**

   ```bash
   npm run dev
   ```

2. **Navigate to a quiz view page:**

   ```
   http://localhost:3000/instructor/quizzes/[quizId]
   ```

3. **Test responsive behavior:**
   - Resize browser window
   - Use browser DevTools device emulation
   - Test on actual mobile devices

### Component Changes

#### New Files

- `src/components/features/instructor/quiz/components/QuizViewActions.tsx`
- `src/components/features/instructor/quiz/components/QuizViewSkeleton.tsx`

#### Modified Files

- `src/components/features/instructor/quiz/components/QuizViewPage.tsx`
- `src/components/features/instructor/quiz/components/QuizViewHeader.tsx`
- `src/components/features/instructor/quiz/components/QuizViewDetails.tsx`
- `src/components/features/instructor/quiz/components/QuizViewConfiguration.tsx`
- `src/components/features/instructor/quiz/components/questions-list/QuestionsListHeader.tsx`
- `src/components/features/instructor/quiz/components/questions-list/QuestionListItem.tsx`

### Key Technical Details

#### Responsive Grid

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
  <div className="lg:col-span-2">
    {/* Main content: 66.6% width on desktop */}
  </div>
  <div className="lg:col-span-1">{/* Sidebar: 33.3% width on desktop */}</div>
</div>
```

#### Container System

```tsx
<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
  {/* Content with responsive padding and max-width */}
</div>
```

#### Card Pattern

All sections now use consistent Card components:

```tsx
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2 text-lg">
      <Icon className="h-5 w-5" />
      Title
    </CardTitle>
  </CardHeader>
  <CardContent>{/* Content */}</CardContent>
</Card>
```

### Testing Checklist

- [ ] Quiz loads correctly
- [ ] All cards display properly
- [ ] Actions (Edit, Publish/Start) work
- [ ] Questions list displays
- [ ] Settings show correct values
- [ ] Responsive at 375px width (mobile)
- [ ] Responsive at 768px width (tablet)
- [ ] Responsive at 1024px+ width (desktop)
- [ ] Touch targets are adequate (≥44px)
- [ ] No horizontal scrolling
- [ ] Loading skeleton displays correctly
- [ ] Error state displays correctly

### Breakpoint Reference

```typescript
// From src/components/shared/hooks/useResponsive.ts
const breakpoints = {
  xs: 0, // Default mobile
  sm: 640, // Small tablets
  md: 768, // Tablets
  lg: 1024, // Desktop (grid activates)
  xl: 1280, // Large desktop
  '2xl': 1536, // Extra large
};
```

### Common Issues

#### Issue: Layout not responsive

**Solution:** Check that container classes are applied:

```tsx
className = 'container mx-auto px-4 sm:px-6 lg:px-8';
```

#### Issue: Cards not showing

**Solution:** Verify Card imports:

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
```

#### Issue: Grid not switching to 3 columns

**Solution:** Check grid classes:

```tsx
className = 'grid grid-cols-1 lg:grid-cols-3';
```

### Style Guide

#### Spacing Scale

- Mobile: `gap-6` (24px)
- Desktop: `gap-8` (32px)
- Cards: `space-y-6` or `space-y-8`

#### Typography

- Page Title: `text-3xl sm:text-4xl`
- Card Title: `text-lg`
- Body Text: `text-sm sm:text-base`

#### Touch Targets

- Minimum: 44x44px
- Buttons: `size="lg"` or custom sizing
- Icon buttons: `h-8 w-8` minimum

### Integration Points

#### Parent Page

```tsx
// src/app/instructor/quizzes/[quizId]/page.tsx
export default function QuizDetailsPage() {
  const params = useParams<{ quizId: string }>();
  const quizId = Number(params?.quizId ?? NaN);

  return <QuizViewPage quizId={quizId} />;
}
```

#### Data Fetching

```tsx
// Uses existing hooks
const { data: quiz, isLoading, error } = useQuiz(quizId);
const updateStatus = useUpdateQuizStatus();
```

### Documentation Files

1. **QUIZ_VIEW_REVAMP.md** - Complete implementation details
2. **LAYOUT_COMPARISON.md** - Visual before/after comparison
3. **CODE_EXAMPLES.md** - Detailed code examples
4. **RESPONSIVE_DESIGN.md** - Breakpoint and responsive behavior details
5. **README.md** (this file) - Quick start guide

### Linting & Type Checking

```bash
# Run linter
npm run lint

# Check TypeScript
npx tsc --noEmit

# Format code
npm run pretty
```

### Questions?

If you have questions about the implementation:

1. Check the documentation files listed above
2. Review the code comments in the components
3. Test the responsive behavior in browser DevTools
4. Refer to the original issue/PR description

## For Designers

### Design System

#### Colors

- Cards: `bg-card` with `border`
- Muted backgrounds: `bg-muted/50`
- Text: `text-card-foreground`, `text-muted-foreground`
- Badges: `variant="outline"`, `variant="default"`, `variant="secondary"`

#### Spacing

- Between sections: 6-8 units (24-32px)
- Card padding: Built into Card component
- Grid gap: 6-8 units (24-32px)

#### Layout

- Max content width: 1280px (`max-w-7xl`)
- Content ratio: 2:1 (main content to sidebar)
- Mobile: Single column, full width
- Desktop: Multi-column grid

### Visual Hierarchy

1. **Page Title** - Largest, most prominent
2. **Card Titles** - Medium, with icons
3. **Content** - Base size, readable
4. **Metadata** - Smaller, muted

### Accessibility

- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation supported
- Sufficient color contrast
- Touch-friendly targets (≥44px)

## For QA

### Test Scenarios

#### Basic Functionality

1. View quiz details
2. Edit quiz
3. Publish/unpublish quiz
4. Add questions
5. View question answers

#### Responsive Testing

1. Test at 375px (iPhone SE)
2. Test at 414px (iPhone 12)
3. Test at 768px (iPad)
4. Test at 1024px (iPad Pro)
5. Test at 1440px (Desktop)

#### Edge Cases

1. Very long quiz titles
2. Quiz with no description
3. Quiz with many questions (20+)
4. Quiz with no questions
5. Different setting combinations

#### Browser Testing

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

### Expected Behavior

#### Mobile (< 768px)

- Single column layout
- Full-width cards
- Shortened button labels
- No horizontal scroll
- Adequate touch targets

#### Tablet (768-1023px)

- Single column layout
- Full button labels
- Better spacing
- Larger text

#### Desktop (≥ 1024px)

- 3-column grid
- Sidebar visible
- Actions always accessible
- Optimal reading width

### Reporting Issues

When reporting issues, include:

1. Screen size/device
2. Browser and version
3. Steps to reproduce
4. Expected vs actual behavior
5. Screenshots if applicable

## Summary

The quiz view page now features:

- ✅ Modern card-based design
- ✅ Fully responsive (mobile to desktop)
- ✅ Better visual hierarchy
- ✅ Improved user experience
- ✅ Cleaner code architecture
- ✅ Better accessibility
- ✅ Consistent with design system

All existing functionality is preserved while providing a much better user experience across all devices.
