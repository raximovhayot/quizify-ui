# MathLive Implementation Guide

## Overview

This guide provides step-by-step instructions for integrating MathLive into the Quizify UI TipTap editor, replacing the current LaTeX text input dialog with a superior WYSIWYG math editing experience.

## Prerequisites

- Node.js 18+
- npm or pnpm
- Understanding of React, TypeScript, and TipTap basics
- Familiarity with Next.js dynamic imports

## Implementation Phases

### Phase 1: Installation & Setup

#### Step 1.1: Install MathLive

```bash
npm install mathlive
# or
pnpm add mathlive
```

Check the installed version:
```bash
npm list mathlive
```

Expected: `mathlive@0.107.x` or later

#### Step 1.2: Verify TypeScript Support

MathLive includes TypeScript definitions. Verify by checking:
```bash
ls node_modules/mathlive/dist/types/
```

You should see `mathlive.d.ts`.

#### Step 1.3: Update Package.json

No additional configuration needed. MathLive works out of the box.

---

### Phase 2: Create MathLive Components

#### Step 2.1: Create MathLiveDialog Component

Create `src/components/shared/form/MathLiveDialog.tsx`:

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { MathfieldElement } from 'mathlive';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Import MathLive CSS
import 'mathlive/static.css';

export interface MathLiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (latex: string) => void;
  mode?: 'inline' | 'block';
  initialLatex?: string;
}

export function MathLiveDialog({
  open,
  onOpenChange,
  onInsert,
  mode = 'inline',
  initialLatex = '',
}: MathLiveDialogProps) {
  const t = useTranslations();
  const mathfieldRef = useRef<MathfieldElement | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize MathLive when dialog opens
  useEffect(() => {
    if (!isClient || !open) return;

    const initMathLive = async () => {
      // Dynamically import MathLive to avoid SSR issues
      const { MathfieldElement } = await import('mathlive');

      // Register custom element if not already registered
      if (!customElements.get('math-field')) {
        customElements.define('math-field', MathfieldElement);
      }

      // Wait for next tick to ensure element is in DOM
      setTimeout(() => {
        if (mathfieldRef.current) {
          mathfieldRef.current.value = initialLatex;
          mathfieldRef.current.smartMode = true;
          
          // Configure virtual keyboard
          mathfieldRef.current.mathVirtualKeyboardPolicy = 'manual';
          
          // Focus the mathfield
          mathfieldRef.current.focus();
        }
      }, 0);
    };

    initMathLive();
  }, [open, isClient, initialLatex]);

  const handleInsert = () => {
    if (mathfieldRef.current) {
      const latex = mathfieldRef.current.value;
      if (latex.trim()) {
        onInsert(latex.trim());
        onOpenChange(false);
      }
    }
  };

  const handleClear = () => {
    if (mathfieldRef.current) {
      mathfieldRef.current.value = '';
      mathfieldRef.current.focus();
    }
  };

  if (!isClient) {
    return null; // Don't render anything on server
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            {t('editor.mathEditor.title', { fallback: 'Math Editor' })}
            {mode === 'block' && (
              <span className="ml-2 text-xs sm:text-sm font-normal text-muted-foreground">
                ({t('editor.mathEditor.displayMode', { fallback: 'Display mode' })})
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {t('editor.mathEditor.mathLiveDescription', {
              fallback: 'Edit mathematical expressions with visual editing and LaTeX support',
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* MathLive Editor */}
          <div className="border rounded-lg p-4 bg-background min-h-[200px]">
            <math-field
              ref={mathfieldRef}
              class="w-full text-2xl"
              style={{
                fontSize: mode === 'block' ? '2rem' : '1.5rem',
                padding: '1rem',
              }}
            />
          </div>

          {/* Quick Help */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              <strong>{t('editor.mathEditor.tips', { fallback: 'Tips' })}:</strong>
            </p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Type naturally: "x^2" for superscript, "x_i" for subscript</li>
              <li>Use "/" for fractions: "1/2" becomes ½</li>
              <li>Type "\sqrt" for square root, "\sum" for summation</li>
              <li>Use arrow keys to navigate, Esc to exit</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={handleClear}>
            {t('editor.mathEditor.clear', { fallback: 'Clear' })}
          </Button>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.actions.cancel', { fallback: 'Cancel' })}
          </Button>
          <Button type="button" onClick={handleInsert}>
            {t('editor.mathEditor.insert', { fallback: 'Insert' })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

#### Step 2.2: Create Lazy-Loaded Wrapper

Create `src/components/shared/form/lazy/MathLiveDialogLazy.tsx`:

```tsx
import dynamic from 'next/dynamic';

import type { MathLiveDialogProps } from '../MathLiveDialog';

/**
 * Lazy-loaded MathLive dialog component
 * 
 * MathLive is loaded only when needed to reduce initial bundle size.
 * The component is client-side only (ssr: false) because MathLive
 * requires browser APIs.
 */
export const MathLiveDialogLazy = dynamic<MathLiveDialogProps>(
  () => import('../MathLiveDialog').then((mod) => mod.MathLiveDialog),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    ),
  }
);
```

#### Step 2.3: Update Index Exports

Update `src/components/shared/form/lazy/index.ts`:

```typescript
export { MathLiveDialogLazy } from './MathLiveDialogLazy';
export { RichTextEditorLazy } from './RichTextEditorLazy';
export { RichTextFieldLazy } from './RichTextFieldLazy';
export { MinimalRichTextEditorLazy } from './MinimalRichTextEditorLazy';
```

---

### Phase 3: Integrate with Existing Editors

#### Step 3.1: Update RichTextEditor

Modify `src/components/shared/form/RichTextEditor.tsx`:

```tsx
// At the top of the file, replace MathEditorDialog import:
// OLD:
// import { MathEditorDialog } from './MathEditorDialog';

// NEW:
import { MathLiveDialogLazy as MathLiveDialog } from './lazy';
```

Then update the dialog usage in the component (around line 196-202):

```tsx
// OLD:
{/* Math Editor Dialog */}
<MathEditorDialog
  open={mathEditorOpen}
  onOpenChange={setMathEditorOpen}
  onInsert={handleMathInsert}
  mode={mathEditorMode}
/>

// NEW:
{/* Math Editor Dialog - Now with MathLive! */}
<MathLiveDialog
  open={mathEditorOpen}
  onOpenChange={setMathEditorOpen}
  onInsert={handleMathInsert}
  mode={mathEditorMode}
/>
```

#### Step 3.2: Update MinimalRichTextEditor

Modify `src/components/shared/form/MinimalRichTextEditor.tsx`:

Same changes as RichTextEditor:

```tsx
// Replace import
import { MathLiveDialogLazy as MathLiveDialog } from './lazy';

// Update component usage
<MathLiveDialog
  open={mathEditorOpen}
  onOpenChange={setMathEditorOpen}
  onInsert={handleMathInsert}
  mode={mathEditorMode}
/>
```

---

### Phase 4: Styling & Theme Integration

#### Step 4.1: Add MathLive Custom Styles

Add to `src/app/globals.css` (at the end):

```css
/* MathLive Editor Customization */
math-field {
  --ml-keyboard-background: hsl(var(--background));
  --ml-keyboard-text: hsl(var(--foreground));
  --ml-contains-highlight: hsl(var(--primary) / 0.2);
  --ml-placeholder-color: hsl(var(--muted-foreground));
  
  border: none;
  outline: none;
  font-family: inherit;
}

math-field:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
  border-radius: 0.375rem;
}

/* Dark mode support */
.dark math-field {
  --ml-keyboard-background: hsl(var(--background));
  --ml-keyboard-text: hsl(var(--foreground));
}

/* Virtual keyboard styling */
.ML__keyboard {
  background: hsl(var(--background));
  border-top: 1px solid hsl(var(--border));
  box-shadow: 0 -4px 6px -1px rgb(0 0 0 / 0.1);
}

.ML__keyboard .ML__keycap {
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  border: 1px solid hsl(var(--border));
  border-radius: 0.25rem;
}

.ML__keyboard .ML__keycap:hover {
  background: hsl(var(--accent));
}

.ML__keyboard .ML__keycap.is-pressed {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}
```

#### Step 4.2: Configure MathLive Theme

Create `src/lib/mathlive-config.ts`:

```typescript
/**
 * MathLive global configuration
 * 
 * This configures MathLive's appearance and behavior to match
 * our application theme and design system.
 */

export function configureMathLive() {
  if (typeof window === 'undefined') return;

  // Configure MathLive options
  import('mathlive').then(({ MathfieldElement }) => {
    // Set default options for all mathfields
    MathfieldElement.options = {
      smartMode: true,
      smartFence: true,
      smartSuperscript: true,
      
      // Keyboard settings
      virtualKeyboardMode: 'manual',
      virtualKeyboards: 'numeric symbols greek',
      
      // Localization
      locale: 'en',
      
      // Appearance
      letterShapeStyle: 'tex',
      
      // Editing behavior
      removeExtraneousParentheses: true,
      scriptDepth: 2,
    };
  });
}
```

Then call this in your root layout or `_app.tsx`:

```tsx
// In src/app/layout.tsx or pages/_app.tsx
import { useEffect } from 'react';
import { configureMathLive } from '@/lib/mathlive-config';

// Inside component
useEffect(() => {
  configureMathLive();
}, []);
```

---

### Phase 5: Testing

#### Step 5.1: Unit Tests

Create `src/components/shared/form/__tests__/MathLiveDialog.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MathLiveDialog } from '../MathLiveDialog';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, options?: any) => options?.fallback || key,
}));

describe('MathLiveDialog', () => {
  const mockOnInsert = jest.fn();
  const mockOnOpenChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open', () => {
    render(
      <MathLiveDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onInsert={mockOnInsert}
      />
    );

    expect(screen.getByText('Math Editor')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <MathLiveDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        onInsert={mockOnInsert}
      />
    );

    expect(screen.queryByText('Math Editor')).not.toBeInTheDocument();
  });

  it('shows display mode label for block mode', () => {
    render(
      <MathLiveDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onInsert={mockOnInsert}
        mode="block"
      />
    );

    expect(screen.getByText(/Display mode/i)).toBeInTheDocument();
  });

  it('calls onOpenChange when cancel is clicked', async () => {
    render(
      <MathLiveDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onInsert={mockOnInsert}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    await userEvent.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  // Note: Testing actual MathLive functionality requires jsdom with custom elements support
  // For now, we test the React wrapper behavior
});
```

#### Step 5.2: Integration Tests

Create `src/components/shared/form/__tests__/RichTextEditor.mathlive.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RichTextEditor } from '../RichTextEditor';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, options?: any) => options?.fallback || key,
}));

describe('RichTextEditor with MathLive', () => {
  it('opens MathLive dialog on formula button click', async () => {
    const mockOnChange = jest.fn();
    
    render(
      <RichTextEditor
        content=""
        onChange={mockOnChange}
      />
    );

    // Wait for editor to hydrate
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Insert inline formula/i })).toBeInTheDocument();
    });

    // Click inline formula button
    const inlineButton = screen.getByRole('button', { name: /Insert inline formula/i });
    await userEvent.click(inlineButton);

    // Dialog should open
    await waitFor(() => {
      expect(screen.getByText('Math Editor')).toBeInTheDocument();
    });
  });
});
```

#### Step 5.3: E2E Tests (Optional)

Add to `tests/e2e/math-editing.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Math Editing with MathLive', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/instructor/quiz/create');
  });

  test('should open MathLive dialog and insert formula', async ({ page }) => {
    // Open question editor
    await page.click('button:has-text("Add Question")');

    // Click inline formula button
    await page.click('[aria-label="Insert inline formula"]');

    // Wait for MathLive dialog
    await expect(page.locator('text=Math Editor')).toBeVisible();

    // Type in MathLive (note: this might need adjustment based on MathLive's actual DOM)
    await page.locator('math-field').type('x^2');

    // Click insert
    await page.click('button:has-text("Insert")');

    // Verify formula was inserted
    await expect(page.locator('.math-inline')).toBeVisible();
  });

  test('should support both inline and block formulas', async ({ page }) => {
    await page.click('button:has-text("Add Question")');

    // Insert inline formula
    await page.click('[aria-label="Insert inline formula"]');
    await page.locator('math-field').fill('a+b');
    await page.click('button:has-text("Insert")');

    // Insert block formula
    await page.click('[aria-label="Insert block formula"]');
    await expect(page.locator('text=Display mode')).toBeVisible();
    await page.locator('math-field').fill('\\sum_{i=1}^{n}');
    await page.click('button:has-text("Insert")');

    // Verify both formulas exist
    await expect(page.locator('.math-inline')).toBeVisible();
    await expect(page.locator('.math-display')).toBeVisible();
  });
});
```

---

### Phase 6: Documentation Updates

#### Step 6.1: Update Component README

Update `src/components/shared/form/README.md` to include MathLive section:

```markdown
### MathLiveDialog

A WYSIWYG math editor dialog powered by MathLive.

**Features:**

- Visual math editing (no LaTeX knowledge required)
- Virtual keyboard for symbols
- Smart mode for automatic formatting
- LaTeX import/export for compatibility
- Inline and display mode support

**Props:**

- `open: boolean` - Whether dialog is open
- `onOpenChange: (open: boolean) => void` - Dialog state change handler
- `onInsert: (latex: string) => void` - Callback when formula is inserted
- `mode?: 'inline' | 'block'` - Formula display mode (default: 'inline')
- `initialLatex?: string` - Initial LaTeX value

**Example:**

```tsx
import { MathLiveDialog } from '@/components/shared/form/MathLiveDialog';

function MyComponent() {
  const [open, setOpen] = useState(false);

  const handleInsert = (latex: string) => {
    console.log('Inserted formula:', latex);
  };

  return (
    <MathLiveDialog
      open={open}
      onOpenChange={setOpen}
      onInsert={handleInsert}
      mode="inline"
    />
  );
}
```

**Benefits:**

- Superior UX compared to text-based LaTeX input
- Reduced learning curve for non-technical users
- Better mobile experience with virtual keyboard
- Improved accessibility
```

#### Step 6.2: Update Main Documentation

Create or update documentation in `docs/`:

- `MATH_EDITING.md` - User guide for math editing
- `MATHLIVE_MIGRATION.md` - Migration notes from old dialog
- Update `CHANGELOG.md` with new feature

---

### Phase 7: Deployment Checklist

#### Pre-deployment

- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] ESLint warnings resolved
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Accessibility tested
- [ ] Mobile testing completed
- [ ] Cross-browser testing done

#### Deployment

- [ ] Deploy to staging environment
- [ ] Smoke test all math editing features
- [ ] Beta test with select users
- [ ] Monitor error logs
- [ ] Gather user feedback

#### Post-deployment

- [ ] Monitor bundle size impact
- [ ] Track usage metrics
- [ ] Address user feedback
- [ ] Plan follow-up improvements

---

## Troubleshooting

### Issue: "math-field is not a valid HTML element"

**Solution**: Ensure MathLive is imported and custom element is registered:

```tsx
import { MathfieldElement } from 'mathlive';

if (!customElements.get('math-field')) {
  customElements.define('math-field', MathfieldElement);
}
```

### Issue: SSR/Hydration Errors

**Solution**: Use dynamic import with `ssr: false`:

```tsx
const MathLiveDialog = dynamic(
  () => import('./MathLiveDialog'),
  { ssr: false }
);
```

### Issue: Styles Not Applied

**Solution**: Import MathLive CSS:

```tsx
import 'mathlive/static.css';
```

And ensure custom styles are in `globals.css`.

### Issue: Virtual Keyboard Not Showing

**Solution**: Set keyboard policy:

```tsx
mathfield.mathVirtualKeyboardPolicy = 'manual';
```

Then show manually when needed:

```tsx
import { showVirtualKeyboard } from 'mathlive';
showVirtualKeyboard();
```

### Issue: TypeScript Errors

**Solution**: Ensure proper type definitions:

```tsx
import type { MathfieldElement } from 'mathlive';

const mathfieldRef = useRef<MathfieldElement | null>(null);
```

---

## Performance Optimization

### Bundle Size

MathLive adds ~200KB (gzipped) to your bundle. Optimize with:

1. **Lazy loading** (already implemented)
2. **Code splitting**:
```tsx
const MathLiveDialog = dynamic(() => import('./MathLiveDialog'), {
  ssr: false,
  loading: () => <LoadingSkeleton />,
});
```

3. **CDN option** (advanced):
```html
<script src="https://unpkg.com/mathlive"></script>
```

### Runtime Performance

MathLive is highly optimized. For better performance:

1. Avoid creating multiple mathfield instances
2. Reuse dialog component across editors
3. Use virtual keyboard judiciously

---

## Advanced Features (Future)

### Custom Virtual Keyboards

```typescript
import { makeSharedVirtualKeyboard } from 'mathlive';

const keyboard = makeSharedVirtualKeyboard({
  customVirtualKeyboards: {
    myKeyboard: {
      label: 'My Keyboard',
      tooltip: 'Custom symbols',
      layer: 'myLayer',
    },
  },
});
```

### Inline Editing (Phase 2)

Create TipTap extension for inline MathLive editing:

```typescript
import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

const InlineMathLive = Node.create({
  name: 'inlineMath',
  // ... extension definition
  addNodeView() {
    return ReactNodeViewRenderer(InlineMathComponent);
  },
});
```

### Formula Templates

Add common formula templates:

```tsx
const TEMPLATES = [
  { name: 'Quadratic', latex: 'ax^2 + bx + c = 0' },
  { name: 'Pythagorean', latex: 'a^2 + b^2 = c^2' },
  // ...
];
```

---

## Support & Resources

- **MathLive Docs**: https://cortexjs.io/mathlive/
- **GitHub**: https://github.com/arnog/mathlive
- **Examples**: https://cortexjs.io/mathlive/demo/
- **Community**: https://github.com/arnog/mathlive/discussions

---

**Last Updated**: 2025-10-22  
**Version**: 1.0  
**Maintained By**: Quizify UI Team
