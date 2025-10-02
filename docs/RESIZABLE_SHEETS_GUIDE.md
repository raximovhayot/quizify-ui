# Quick Start: Resizable Mobile Sheets

This guide shows you how to use the new drag-to-resize functionality for mobile bottom sheets.

## Basic Usage

### 1. Import Components

```tsx
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { useResponsive } from '@/components/shared/hooks/useResponsive';
```

### 2. Create Responsive Modal

```tsx
export function MyModal({ open, onOpenChange }) {
  const { isMobile } = useResponsive();

  // Shared content
  const content = <MyForm />;

  // Mobile: Resizable Sheet
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          resizable
          snapPoints={['60vh', '80vh', '95vh']}
          className="overflow-y-auto px-4 pb-safe rounded-t-2xl"
        >
          <SheetHeader hasResizeHandle>
            <SheetTitle>My Form</SheetTitle>
          </SheetHeader>
          <div className="pb-8">{content}</div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogTitle>My Form</DialogTitle>
        {content}
      </DialogContent>
    </Dialog>
  );
}
```

## Props Reference

### SheetContent

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `resizable` | `boolean` | `false` | Enable drag-to-resize functionality |
| `snapPoints` | `string[]` | `['50vh', '75vh', '90vh']` | Viewport height snap points |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'right'` | Sheet position (resize only works with 'bottom') |

### SheetHeader

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `hasResizeHandle` | `boolean` | `false` | Add top padding to accommodate drag handle |

## Snap Points

### Choosing Snap Points

**Small forms (1-3 fields)**:
```tsx
snapPoints={['50vh', '70vh', '85vh']}
```

**Medium forms (4-8 fields)**:
```tsx
snapPoints={['60vh', '80vh', '95vh']}  // Default
```

**Large forms (9+ fields)**:
```tsx
snapPoints={['70vh', '85vh', '98vh']}
```

### Custom Snap Points

You can use any CSS height units:
- Viewport height: `'60vh'`, `'80vh'`
- Pixels: `'400px'`, `'600px'`
- Percentage: `'75%'`, `'90%'`

**Example**:
```tsx
snapPoints={['400px', '600px', '90vh']}
```

## Styling

### Required Classes

```tsx
<SheetContent
  // Enable scrolling
  className="overflow-y-auto"
  // Horizontal padding
  className="px-4"
  // Safe area for notched devices
  className="pb-safe"
  // Rounded top corners
  className="rounded-t-2xl"
>
```

### Full Example with All Classes

```tsx
<SheetContent
  side="bottom"
  resizable
  snapPoints={['60vh', '80vh', '95vh']}
  className="overflow-y-auto px-4 pb-safe rounded-t-2xl"
>
  <SheetHeader hasResizeHandle className="pb-4">
    <SheetTitle>Title</SheetTitle>
  </SheetHeader>
  <div className="pb-8">
    {/* Content with bottom padding */}
  </div>
</SheetContent>
```

## Form Patterns

### Simple Form

```tsx
<SheetContent side="bottom" resizable snapPoints={['50vh', '70vh', '85vh']}>
  <SheetHeader hasResizeHandle>
    <SheetTitle>Quick Edit</SheetTitle>
  </SheetHeader>
  <form className="space-y-4 pb-8">
    <Input label="Name" />
    <Input label="Email" />
    <div className="flex gap-2">
      <Button variant="outline">Cancel</Button>
      <Button>Save</Button>
    </div>
  </form>
</SheetContent>
```

### Complex Form with Sections

```tsx
<SheetContent side="bottom" resizable snapPoints={['70vh', '85vh', '98vh']}>
  <SheetHeader hasResizeHandle>
    <SheetTitle>Detailed Form</SheetTitle>
  </SheetHeader>
  <div className="space-y-6 pb-8">
    <section className="space-y-4">
      <h3 className="font-semibold">Section 1</h3>
      {/* Fields */}
    </section>
    
    <Separator />
    
    <section className="space-y-4">
      <h3 className="font-semibold">Section 2</h3>
      {/* Fields */}
    </section>
    
    <div className="flex justify-end gap-2 pt-4">
      <Button variant="outline">Cancel</Button>
      <Button>Submit</Button>
    </div>
  </div>
</SheetContent>
```

## Responsive Buttons

### Mobile-Friendly Button Layout

```tsx
// Stack buttons on mobile, inline on desktop
<div className="flex flex-col sm:flex-row justify-end gap-2">
  <Button variant="outline" className="w-full sm:w-auto">
    Cancel
  </Button>
  <Button className="w-full sm:w-auto">
    Save
  </Button>
</div>
```

### Full Width on Mobile

```tsx
<Button className="w-full sm:w-auto">
  Submit
</Button>
```

## Responsive Grids

### Two-Column Grid

```tsx
// Stack on mobile, side-by-side on small screens and up
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <Input label="First Name" />
  <Input label="Last Name" />
</div>
```

### Responsive Span

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <Input label="First Name" />
  <Input label="Last Name" />
  <Input label="Email" className="sm:col-span-2" />
</div>
```

## Touch Targets

### Minimum Sizes

All interactive elements should meet minimum touch target sizes:

```tsx
// Buttons
<Button size="sm">         {/* 32px height */}
<Button size="default">    {/* 36px height */}
<Button size="lg">         {/* 40px height */}

// Inputs
<Input />                  {/* 36px height (h-9) */}

// Drag Handle
// Automatically 16px wide × 8px tall touch area
```

## Common Patterns

### Loading State

```tsx
{isLoading ? (
  <div className="space-y-4">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-4 w-full" />
  </div>
) : (
  <MyForm />
)}
```

### Error State

```tsx
{error ? (
  <ContentPlaceholder
    title="Error"
    description={error.message}
    actions={[{ label: 'Retry', onClick: retry }]}
  />
) : (
  <MyForm />
)}
```

### Conditional Rendering

```tsx
const content = isLoading ? <LoadingSkeleton /> 
  : error ? <ErrorView /> 
  : <MyForm />;

if (isMobile) {
  return <Sheet>{content}</Sheet>;
}
return <Dialog>{content}</Dialog>;
```

## Accessibility

### Required Attributes

The drag handle automatically includes:
- `role="button"` - Identifies as interactive
- `aria-label="Drag to resize"` - Describes action
- `tabIndex={0}` - Keyboard accessible
- `cursor-grab` / `cursor-grabbing` - Visual feedback

### Screen Readers

```tsx
<SheetTitle>
  {/* Always provide meaningful titles */}
  Edit Quiz Settings
</SheetTitle>
```

### Keyboard Support

The sheet can be dismissed with:
- Escape key
- Click outside
- Close button

## Testing

### Manual Testing Checklist

- [ ] Drag handle is visible and clickable
- [ ] Sheet snaps to defined points
- [ ] Smooth transitions between snaps
- [ ] Works on touch devices (iOS/Android)
- [ ] Works with mouse (desktop)
- [ ] Content scrolls when needed
- [ ] Buttons are touch-friendly (44x44px min)
- [ ] Safe area padding on notched devices

### Browser DevTools

1. Open responsive mode (Cmd/Ctrl + Shift + M)
2. Select mobile device (iPhone, Pixel, etc.)
3. Test drag-to-resize
4. Check different viewport heights
5. Verify snap point behavior

## Troubleshooting

### Sheet not resizing

**Problem**: Drag handle doesn't work
**Solution**: 
- Ensure `resizable={true}` is set
- Verify `side="bottom"` (resize only works on bottom sheets)
- Check that drag handle is not covered by other elements

### Content not scrolling

**Problem**: Content is cut off
**Solution**:
- Add `overflow-y-auto` to SheetContent
- Remove fixed height constraints
- Ensure content wrapper has proper padding

### Snap points not working

**Problem**: Sheet doesn't snap to defined points
**Solution**:
- Verify snap points are valid CSS units
- Check that snap points are in ascending order
- Ensure at least 2 snap points are defined

### Touch target too small

**Problem**: Hard to tap on mobile
**Solution**:
- Use minimum 44x44px for touch targets
- Add proper padding around clickable elements
- Use `w-full sm:w-auto` for mobile buttons

## Examples in Codebase

See these files for complete examples:

1. **Quiz Creation**: `src/app/instructor/quizzes/@modal/(.)new/page.tsx`
2. **Quiz Editing**: `src/app/instructor/quizzes/@modal/(.)[quizId]/edit/page.tsx`
3. **Question Creation**: `src/components/features/instructor/quiz/components/CreateQuestionModal.tsx`
4. **Question Editing**: `src/components/features/instructor/quiz/components/questions-list/EditQuestionDialog.tsx`

## Best Practices

1. **Always use responsive detection**: Check `isMobile` before rendering
2. **Provide meaningful snap points**: Choose heights that make sense for your content
3. **Test on real devices**: Simulators don't always match real behavior
4. **Maintain consistency**: Use same snap points across similar forms
5. **Consider content length**: Longer forms need larger snap points
6. **Add proper padding**: Account for drag handle and safe areas
7. **Full-width buttons on mobile**: Better touch targets
8. **Semantic HTML**: Use proper heading hierarchy and labels

## Next Steps

- Review [REVAMP_SUMMARY.md](./REVAMP_SUMMARY.md) for complete technical details
- Check [mobile-question-management.md](./mobile-question-management.md) for previous mobile patterns
- See [QUICK_START_RICH_TEXT.md](./QUICK_START_RICH_TEXT.md) for rich text editor integration
