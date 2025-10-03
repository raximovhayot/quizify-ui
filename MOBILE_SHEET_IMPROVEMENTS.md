# Mobile Sheet Keyboard Improvements

## Problem Statement

Mobile instructor features were experiencing several issues:

1. **Keyboard flickering**: Sheet height would change unexpectedly when mobile keyboard opened/closed
2. **Keyboard not opening**: Input fields sometimes wouldn't trigger the keyboard properly
3. **Poor UX**: Drag handle interfered with keyboard interaction

## Solutions Implemented

### 1. Visual Viewport API Integration

- **Changed from**: `window.innerHeight` for viewport calculations
- **Changed to**: `window.visualViewport.height` for keyboard-aware height
- **Why**: The Visual Viewport API provides accurate viewport dimensions that account for the on-screen keyboard, preventing flickering when the keyboard appears

### 2. Keyboard Detection

- Added automatic detection of keyboard open/close state
- Uses a threshold of 100px difference between `window.innerHeight` and `visualViewport.height`
- Prevents drag-to-resize functionality when keyboard is open
- Hides the drag handle when keyboard is visible for cleaner UI

### 3. Input Focus Protection

- Prevents drag-to-resize when an input field is focused
- Checks for `INPUT`, `TEXTAREA`, and elements with `contenteditable` attribute
- Ensures smooth typing experience without accidental resizing

### 4. Auto-Resize on Keyboard Open

- Automatically adjusts sheet to the smallest snap point (60vh) when keyboard opens
- Ensures input fields remain visible above the keyboard
- Smooth transition with proper animation

### 5. Auto-Scroll to Focused Input

- When keyboard opens, automatically scrolls the focused input into view
- Uses `scrollIntoView` with smooth behavior
- 300ms delay to account for keyboard animation

### 6. Stable Height During Drag

- Stores initial viewport height at the start of drag
- Uses stored height throughout drag operation
- Prevents recalculation mid-drag that could cause jank

### 7. Touch Event Optimization

- Added `{ passive: false }` to `touchmove` event listener
- Improves touch responsiveness and control
- Allows preventDefault if needed in future enhancements

## Technical Details

### Key Changes in `ResizableSheet.tsx`

#### New Helper Function

```typescript
function getViewportHeight(): number {
  if (typeof window !== 'undefined' && window.visualViewport) {
    return window.visualViewport.height;
  }
  return typeof window !== 'undefined' ? window.innerHeight : 0;
}
```

#### Keyboard Detection Hook

```typescript
React.useEffect(() => {
  if (typeof window === 'undefined' || !window.visualViewport) return;

  const handleResize = () => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const heightDiff = window.innerHeight - viewport.height;
    const keyboardOpen = heightDiff > 100;
    setIsKeyboardOpen(keyboardOpen);

    if (keyboardOpen && currentSnapIndex !== 0) {
      setCurrentSnapIndex(0); // Auto-resize to smallest snap point
    }
  };

  window.visualViewport.addEventListener('resize', handleResize);
  return () => {
    window.visualViewport?.removeEventListener('resize', handleResize);
  };
}, [currentSnapIndex]);
```

#### Input Focus Protection

```typescript
const handleDragStart = React.useCallback(
  (e: React.TouchEvent | React.MouseEvent) => {
    if (!enabled) return;

    // Don't allow dragging when keyboard is open
    if (isKeyboardOpen) return;

    // Don't allow dragging when focused on input
    const activeElement = document.activeElement;
    if (
      activeElement?.tagName === 'INPUT' ||
      activeElement?.tagName === 'TEXTAREA' ||
      activeElement?.hasAttribute('contenteditable')
    ) {
      return;
    }

    // ... rest of drag logic
  },
  [enabled, currentSnapIndex, snapPoints, isKeyboardOpen]
);
```

## Browser Compatibility

### Visual Viewport API Support

- ✅ Chrome/Edge 61+
- ✅ Safari 13+
- ✅ Firefox 91+
- ✅ All modern mobile browsers

### Fallback Behavior

- Falls back to `window.innerHeight` if `visualViewport` is not available
- Gracefully degrades on older browsers
- Still provides basic functionality

## Impact on User Experience

### Before

- ❌ Sheet height would jump/flicker when keyboard opened
- ❌ Drag handle could interfere with typing
- ❌ Inputs might be hidden behind keyboard
- ❌ Unpredictable behavior during keyboard transitions

### After

- ✅ Smooth, predictable sheet behavior
- ✅ Drag handle automatically hides when keyboard is open
- ✅ Inputs always visible and accessible
- ✅ Auto-resize to optimal height for keyboard input
- ✅ Auto-scroll ensures focused input is visible

## Files Modified

- `src/components/shared/ui/ResizableSheet.tsx` - Core improvements

## Testing Recommendations

1. **Mobile Devices**: Test on real iOS and Android devices
2. **Input Focus**: Tap various input fields and verify keyboard behavior
3. **Drag to Resize**: Verify drag still works when keyboard is closed
4. **Multiple Inputs**: Test forms with multiple input fields
5. **Different Keyboard Types**: Test with text, email, number keyboards
6. **Rotation**: Test landscape/portrait orientation changes

## Future Enhancements

Consider adding:

- Configurable keyboard detection threshold
- Option to disable auto-resize on keyboard open
- Custom snap point selection on keyboard open
- Accessibility announcements for keyboard state changes
