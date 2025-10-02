# Question Creation UI - Visual Guide

## Desktop Experience

### Question Creation Modal (Desktop)

**Location**: Centered dialog with max-width of 2xl (672px)

**Structure**:
```
┌─────────────────────────────────────────────┐
│  Create Question                         ✕  │
│─────────────────────────────────────────────│
│                                             │
│  Question Type:                             │
│  ┌─────────────────────────────────────┐   │
│  │ Multiple Choice              ▼      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Points:                                    │
│  ┌─────────────────────────────────────┐   │
│  │ 10                                  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Question:                               *  │
│  ┌─────────────────────────────────────┐   │
│  │ [B][I][</>]│[•][1.]│[↶][↷]          │   │
│  ├─────────────────────────────────────┤   │
│  │                                     │   │
│  │ Enter your question here...        │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Explanation (optional):                    │
│  ┌─────────────────────────────────────┐   │
│  │ Add explanation or feedback...      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Answers section - type specific]         │
│                                             │
│  ─────────────────────────────────────      │
│                                             │
│              [Cancel]  [Create]             │
└─────────────────────────────────────────────┘
```

## Mobile Experience

### Question Creation Sheet (Mobile)

**Location**: Bottom drawer, slides up from bottom, 90vh height

**Structure**:
```
┌─────────────────────────┐
│                         │
│     [Top 10vh free]     │
│                         │
├─────────────────────────┤ ← Slide from here
│ Create Question      ✕  │
├─────────────────────────┤
│                         │
│ Question Type:          │
│ ┌─────────────────────┐ │
│ │ Multiple Choice   ▼ │ │
│ └─────────────────────┘ │
│                         │
│ Points:                 │
│ ┌─────────────────────┐ │
│ │ 10                  │ │
│ └─────────────────────┘ │
│                         │
│ Question:            *  │
│ ┌─────────────────────┐ │
│ │[B][I][</>]│[•][1.]│ │ │
│ │[↶][↷]               │ │
│ ├─────────────────────┤ │
│ │                     │ │
│ │ Enter your         │ │
│ │ question here...   │ │
│ │                     │ │
│ │                     │ │
│ └─────────────────────┘ │
│                         │
│ [Scrollable content]    │
│                         │
│ [Safe padding bottom]   │
└─────────────────────────┘
```

## Rich Text Editor Toolbar

### Desktop Layout (Wide)
```
┌──────────────────────────────────────────────────┐
│  [B] [I] [</>]  │  [•] [1.]  │  [↶] [↷]          │
│  Text Format       Lists        History           │
└──────────────────────────────────────────────────┘
```

### Mobile Layout (Wrapped)
```
┌──────────────────────────────┐
│  [B] [I] [</>]  │  [•] [1.]  │
│  [↶] [↷]                      │
└──────────────────────────────┘
```

## Question Display

### Desktop Question List Item
```
┌────────────────────────────────────────────────────────────────┐
│  #1  [Multiple Choice]  [10 pts]                            ⋮  │
│                                                                 │
│  What is the capital of France?                                │
│  This question tests basic geography knowledge                  │
│                                                                 │
│  ○ London    ○ Berlin    ● Paris    ○ Madrid                   │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Mobile Question List Item (Responsive)
```
┌─────────────────────────────────────┐
│  #1  [Multiple Choice]             ⋮│
│      [10 pts]                       │
│                                     │
│  What is the capital of France?    │
│  This question tests basic...      │
│                                     │
│  ○ London     ○ Berlin              │
│  ● Paris      ○ Madrid              │
│                                     │
└─────────────────────────────────────┘
```

## Rich Text Content Examples

### Question with Formatting
```
Question: Explain the difference between **null** and **undefined** in JavaScript.

Rendered as:
  Explain the difference between null and undefined in JavaScript.
  (with bold styling on null and undefined)
```

### Question with List
```
Question: What are the three pillars of OOP?
• Encapsulation
• Inheritance  
• Polymorphism

Rendered with proper bullet list styling
```

### Question with Code
```
Question: What does the following code output?

`console.log(typeof null)`

Rendered with inline code styling
```

## Responsive Breakpoints

### Mobile (< 768px)
- **Modal**: Sheet (bottom drawer)
- **Grid**: Single column
- **Toolbar**: Wrapped buttons
- **Text**: Smaller font sizes
- **Spacing**: Compact padding

### Tablet (768px - 1023px)
- **Modal**: Dialog (centered)
- **Grid**: 2 columns for some fields
- **Toolbar**: Full width
- **Text**: Medium font sizes
- **Spacing**: Normal padding

### Desktop (≥ 1024px)
- **Modal**: Dialog (centered, max 672px)
- **Grid**: 2 columns where appropriate
- **Toolbar**: Full width with separators
- **Text**: Optimal font sizes
- **Spacing**: Generous padding

## Touch Targets (Mobile)

All interactive elements meet minimum touch target size:

```
┌──────────────┐
│              │  Minimum: 44x44px
│    Button    │  (Apple HIG recommendation)
│              │
└──────────────┘
```

Examples:
- Toolbar buttons: 32px icon in 44px container
- Close button: 44x44px touch area
- Dropdown triggers: Full width, min 44px height
- Action menu items: 48px height for better spacing

## Safe Area Support

For notched devices (iPhone X, 11, 12, etc.):

```
┌─────────────────────────┐
│      Status Bar          │ ← Notch area
├─────────────────────────┤
│                          │
│   Content Area           │
│                          │
│   Scrollable             │
│                          │
├─────────────────────────┤
│   Action Buttons         │
│                          │
│   [Safe Padding]         │ ← env(safe-area-inset-bottom)
└─────────────────────────┘
       Home Indicator
```

## Accessibility Features

### Keyboard Navigation

Desktop keyboard shortcuts:
- `Ctrl/Cmd + B` - Bold
- `Ctrl/Cmd + I` - Italic
- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Shift + Z` - Redo
- `Tab` - Navigate between fields
- `Enter` - Submit form
- `Esc` - Close modal

### Screen Reader Support

ARIA labels for all interactive elements:
```html
<button aria-label="Bold">
  <BoldIcon />
</button>

<button aria-label="Close dialog">
  <XIcon />
  <span class="sr-only">Close</span>
</button>
```

### Focus States

All interactive elements have visible focus indicators:
```css
:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}
```

## Animation & Transitions

### Sheet Slide Animation (Mobile)
```
Initial State: translateY(100%)
Open State: translateY(0)
Duration: 300ms ease-in-out
```

### Dialog Fade Animation (Desktop)
```
Initial State: opacity(0) scale(0.95)
Open State: opacity(1) scale(1)
Duration: 200ms ease-out
```

### Button Hover States
```
Normal: background-color: transparent
Hover: background-color: var(--accent)
Active: background-color: var(--accent)
Transition: 150ms ease
```

## Dark Mode Support

All components adapt to dark mode:

**Light Mode:**
- Background: White (#ffffff)
- Text: Dark gray (#1a1a1a)
- Borders: Light gray (#e5e5e5)

**Dark Mode:**
- Background: Dark gray (#1a1a1a)
- Text: Off-white (#f5f5f5)
- Borders: Dark borders (rgba(255,255,255,0.1))

Editor toolbar automatically adjusts:
- Active button background changes with theme
- Icons inherit current text color
- Borders use theme border color

## Performance Considerations

### Lazy Loading
- Tiptap editor loads only when modal opens
- Extensions load on-demand
- No impact on initial page load

### Optimization
- Debounced onChange handlers
- Memoized components
- Efficient re-renders
- Virtual scrolling for long question lists (if implemented)

## Browser Support

Tested and working on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile Safari (iOS 14+)
- ✅ Chrome Mobile (Android)

Fallbacks:
- CSS Grid → Flexbox for older browsers
- env(safe-area-inset-*) → Regular padding as fallback
- Modern animations → Reduced motion for accessibility
