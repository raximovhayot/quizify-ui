# MathLive Quick Start Guide

## 5-Minute Overview

This guide gets you started with MathLive integration in under 5 minutes.

## Step 1: Install MathLive (30 seconds)

```bash
npm install mathlive
# or
pnpm add mathlive
```

## Step 2: Create Basic Component (2 minutes)

Create `src/components/shared/form/MathLiveDialog.tsx`:

```tsx
'use client';

import { useEffect, useRef } from 'react';
import type { MathfieldElement } from 'mathlive';
import 'mathlive/static.css';

export function MathLiveDialog({ open, onInsert }) {
  const mathfieldRef = useRef<MathfieldElement | null>(null);

  useEffect(() => {
    if (!open) return;
    
    const init = async () => {
      const { MathfieldElement } = await import('mathlive');
      
      if (!customElements.get('math-field')) {
        customElements.define('math-field', MathfieldElement);
      }
      
      setTimeout(() => {
        mathfieldRef.current?.focus();
      }, 0);
    };
    
    init();
  }, [open]);

  const handleInsert = () => {
    const latex = mathfieldRef.current?.value || '';
    if (latex.trim()) {
      onInsert(latex.trim());
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full">
        <h2 className="text-xl font-bold mb-4">Math Editor</h2>
        
        <math-field
          ref={mathfieldRef}
          className="w-full p-4 border rounded text-2xl"
        />
        
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={handleInsert}>Insert</button>
        </div>
      </div>
    </div>
  );
}
```

## Step 3: Use in Your Editor (1 minute)

```tsx
import { MathLiveDialog } from './MathLiveDialog';

function MyEditor() {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const handleInsert = (latex: string) => {
    console.log('Insert formula:', latex);
    setDialogOpen(false);
  };
  
  return (
    <>
      <button onClick={() => setDialogOpen(true)}>
        Insert Formula
      </button>
      
      <MathLiveDialog
        open={dialogOpen}
        onInsert={handleInsert}
      />
    </>
  );
}
```

## Step 4: Try It Out! (1 minute)

1. Click "Insert Formula"
2. Type: `x^2`
3. Watch it become: x²
4. Try: `1/2` → becomes ½
5. Try: `\sqrt{x}` → becomes √x

## That's It! 🎉

You now have a working MathLive integration.

---

## Next Steps

For production-ready implementation, see:
- **MATHLIVE_IMPLEMENTATION_GUIDE.md** - Complete guide
- **MATHLIVE_RESEARCH.md** - Technical details
- **MATHLIVE_UX_IDEAS.md** - UX best practices

## Common Enhancements

### Add Virtual Keyboard

```tsx
<button onClick={() => {
  import('mathlive').then(({ showVirtualKeyboard }) => {
    showVirtualKeyboard();
  });
}}>
  Show Keyboard
</button>
```

### Add Dark Mode Support

```css
.dark math-field {
  --ml-keyboard-background: #1a1a1a;
  --ml-keyboard-text: #ffffff;
}
```

### Add Symbol Shortcuts

```tsx
const symbols = ['½', 'x²', '√', '∑', '∫', 'π'];

{symbols.map(s => (
  <button onClick={() => {
    mathfieldRef.current.insert(s);
  }}>
    {s}
  </button>
))}
```

---

## Troubleshooting

### Issue: "math-field not defined"
**Fix:** Import and register:
```tsx
import { MathfieldElement } from 'mathlive';
customElements.define('math-field', MathfieldElement);
```

### Issue: SSR errors
**Fix:** Use dynamic import:
```tsx
const MathLive = dynamic(() => import('./MathLive'), { ssr: false });
```

### Issue: Styles not applied
**Fix:** Import CSS:
```tsx
import 'mathlive/static.css';
```

---

## Quick Reference

### Common LaTeX Commands

| Type | Get | Description |
|------|-----|-------------|
| `x^2` | x² | Superscript |
| `x_i` | xᵢ | Subscript |
| `1/2` | ½ | Fraction |
| `\sqrt{x}` | √x | Square root |
| `\sum` | ∑ | Summation |
| `\int` | ∫ | Integral |
| `\pi` | π | Pi |
| `\alpha` | α | Alpha |

### MathLive API Basics

```tsx
// Get LaTeX value
const latex = mathfield.value;

// Set LaTeX value
mathfield.value = 'x^2';

// Insert at cursor
mathfield.insert('\\pi');

// Focus mathfield
mathfield.focus();

// Clear content
mathfield.value = '';
```

---

## Resources

- **Docs:** https://cortexjs.io/mathlive/
- **Demo:** https://cortexjs.io/mathlive/demo/
- **GitHub:** https://github.com/arnog/mathlive
- **Guide:** docs/MATHLIVE_IMPLEMENTATION_GUIDE.md

---

**Ready to implement?** Follow the full guide: `MATHLIVE_IMPLEMENTATION_GUIDE.md`

**Questions?** Check: `MATHLIVE_RESEARCH.md` for technical details

**Last Updated:** 2025-10-22
