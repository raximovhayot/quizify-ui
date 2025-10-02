# Mobile-Responsive Question Management

## Overview

The question creation and editing experience has been optimized for mobile devices while maintaining desktop functionality.

## Key Components

### CreateQuestionModal

A responsive modal for creating new questions that adapts to screen size:

- **Desktop**: Uses Dialog component with centered modal
- **Mobile**: Uses Sheet component (bottom drawer) for better mobile UX

**Features:**
- Automatic responsive switching based on screen size
- Question type selector
- Rich text editor for question content
- Proper touch handling on mobile
- Safe area support for notched devices

**Usage:**
```tsx
import { CreateQuestionModal } from '@/components/features/instructor/quiz/components/CreateQuestionModal';

function QuizManager() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add Question</Button>
      <CreateQuestionModal
        quizId={quizId}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
```

### EditQuestionDialog

A responsive modal for editing existing questions:

- **Desktop**: Dialog with centered modal
- **Mobile**: Sheet (bottom drawer) for better mobile experience

**Features:**
- Automatic responsive switching
- Pre-filled form with existing question data
- Rich text editor for content editing
- Touch-optimized controls

## Mobile Optimizations

### Responsive Detection

Uses the `useResponsive` hook to detect screen size:

```tsx
import { useResponsive } from '@/components/shared/hooks/useResponsive';

function MyComponent() {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Conditional rendering based on device
  if (isMobile) {
    return <MobileView />;
  }
  return <DesktopView />;
}
```

### Sheet vs Dialog

**Dialog (Desktop):**
- Centered on screen
- Max width constraint (2xl)
- Scrollable content
- Close button in top-right

**Sheet (Mobile):**
- Slides up from bottom
- 90% viewport height
- Better for touch interactions
- Thumb-friendly close button

### Touch-Friendly Features

1. **Larger tap targets**: Buttons are sized appropriately for touch (min 44x44px)
2. **Scrollable content**: Forms scroll within the modal, not the page
3. **Safe area support**: Padding accounts for notches and home indicators
4. **Optimized keyboard**: Form inputs trigger appropriate mobile keyboards

### Safe Area Support

The `.pb-safe` class ensures content isn't hidden by device chrome:

```css
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .pb-safe {
    padding-bottom: max(2rem, env(safe-area-inset-bottom));
  }
}
```

Applied to Sheet content for notched devices (iPhone X+, etc.).

## Question Display

### QuestionListItem

Enhanced to properly display rich text content on mobile:

**Mobile Optimizations:**
- Responsive layout with flex wrapping
- Text truncation with line-clamp
- Touch-friendly action menu
- Proper spacing for small screens
- Rich text rendering support

**Features:**
- Detects HTML content and renders with RichTextDisplay
- Falls back to plain text for simple content
- Strips HTML from explanations for clean previews
- Responsive badges and metadata

## Best Practices

### When to Use Sheet vs Dialog

**Use Sheet (mobile) when:**
- Form needs significant vertical space
- User needs to see multiple fields
- Input requires keyboard (avoids viewport jumping)
- Content is primarily scrollable

**Use Dialog when:**
- Simple confirmations
- Desktop-only features
- Fixed-size content
- Alert-style messages

### Responsive Patterns

```tsx
// Pattern 1: Conditional component rendering
if (isMobile) {
  return <Sheet>...</Sheet>;
}
return <Dialog>...</Dialog>;

// Pattern 2: Shared content
const content = <FormContent />;

return isMobile ? (
  <Sheet>{content}</Sheet>
) : (
  <Dialog>{content}</Dialog>
);

// Pattern 3: Different layouts
<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
  {/* Stacks on mobile, side-by-side on desktop */}
</div>
```

### Testing on Mobile

1. **Browser DevTools**: Use responsive mode to test different screen sizes
2. **Real devices**: Test on actual phones/tablets when possible
3. **Viewport units**: Test landscape and portrait orientations
4. **Touch gestures**: Ensure swipe to close works on Sheet
5. **Keyboard behavior**: Verify form inputs work with mobile keyboards

## Accessibility

All responsive components maintain accessibility:

- Proper ARIA labels
- Keyboard navigation (where applicable)
- Focus management
- Screen reader announcements
- Semantic HTML structure

## Future Enhancements

Potential improvements:
- Gesture support (swipe to close Sheet)
- Haptic feedback on mobile interactions
- Progressive enhancement for better devices
- Offline support for form drafts
- Voice input for question content
