# Phase 2: Inline Math Editing - User Guide

## Overview

Phase 2 introduces **hybrid inline + dialog editing** for mathematical formulas in Quizify UI. This enhancement provides a more seamless editing experience by allowing you to edit existing formulas directly inline while maintaining the full dialog for complex operations.

## What's New

### 1. Click-to-Edit Formulas

**Before (Phase 1):**
- Had to delete and re-insert formulas to make changes
- Always required opening the full dialog

**Now (Phase 2):**
- Click any existing formula to edit it inline
- See changes immediately without context switching
- Much faster for simple edits

### 2. Inline Editor

When you click on an existing formula, a compact inline editor appears with:
- **Visual editing** powered by MathLive
- **Quick actions**: Save, Cancel, Expand
- **Keyboard shortcuts**: Enter to save, Escape to cancel
- **Expand option**: Open full dialog for complex edits

### 3. Full Dialog (Enhanced)

The dialog is still available and now supports:
- **Inserting new formulas** from the toolbar
- **Editing existing formulas** when expanded from inline editor
- **Pre-filled content** when expanding from inline

## User Workflows

### Workflow 1: Quick Edit (New!)

1. Click on any formula in your text
2. Inline editor appears
3. Make your changes
4. Press Enter or click Save

**Use case:** Fixing typos, changing coefficients, simple modifications

### Workflow 2: Complex Edit (New!)

1. Click on a formula to open inline editor
2. Click the Expand button (⤢)
3. Full dialog opens with your formula
4. Make complex changes with full features
5. Click Insert to save

**Use case:** Restructuring equations, adding complex symbols

### Workflow 3: Insert New Formula

1. Click formula button in toolbar (𝑥² for inline or ∫ for block)
2. Full dialog opens
3. Create your formula
4. Click Insert

**Use case:** Adding new mathematical expressions

## Features in Detail

### Inline Editor Features

- **WYSIWYG editing**: See exactly what you're creating
- **Compact design**: Doesn't disrupt your document flow
- **Auto-focus**: Starts editing immediately
- **Smart positioning**: Appears near the formula
- **Keyboard navigation**: Full keyboard support

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Save inline edit | Enter |
| Cancel inline edit | Escape |
| Navigate in formula | Arrow keys |
| Superscript | ^ |
| Subscript | _ |
| Fraction | / |

### Formula Types Supported

- **Inline formulas**: $x^2 + y^2 = z^2$ within text
- **Display formulas**: $$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$$ on separate lines

Both types support inline editing!

## Tips & Best Practices

### When to Use Inline Editor

✅ Quick fixes and minor edits
✅ Changing numbers or simple variables
✅ Adding/removing single terms
✅ Adjusting exponents or subscripts

### When to Use Full Dialog

✅ Creating new complex formulas
✅ Major restructuring
✅ Using advanced symbols and templates
✅ Need more space to work

### Pro Tips

1. **Double-check before saving**: Preview is live, verify it looks correct
2. **Use expand freely**: You can always expand to full dialog if needed
3. **Keyboard shortcuts**: Master Enter and Escape for fastest workflow
4. **Click outside to cancel**: Clicking elsewhere cancels the inline edit

## Accessibility

Phase 2 maintains full accessibility:
- **Keyboard navigation**: All features accessible via keyboard
- **Screen readers**: Full support for math content
- **Focus indicators**: Clear visual focus states
- **ARIA labels**: Proper semantic markup

## Technical Details

### Architecture

```
User Action → Event → Response
─────────────────────────────────────
Click formula → Opens inline editor
Enter key → Saves and closes
Escape key → Cancels and closes
Expand button → Opens full dialog with content
Dialog insert → Updates formula in place
```

### Browser Compatibility

Same as Phase 1:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (with touch optimization)

## Migration from Phase 1

**Good news**: No migration needed! All existing formulas work automatically with inline editing.

- Formulas created in Phase 1 are fully editable in Phase 2
- No data conversion required
- Old and new formulas coexist seamlessly

## Troubleshooting

### Inline editor doesn't appear

- **Check**: Is the editor in edit mode? (not read-only)
- **Try**: Click directly on the formula
- **Alternative**: Use toolbar to insert/replace

### Formula looks different

- **Cause**: LaTeX syntax might need adjustment
- **Fix**: Edit inline or in dialog to correct
- **Verify**: Check preview before saving

### Can't expand to dialog

- **Check**: Expand button is visible in inline editor
- **Try**: Use toolbar button to insert fresh formula
- **Report**: If issue persists, contact support

## Feedback

We'd love to hear your thoughts on Phase 2!

**What works well?**
**What could be better?**
**What features would you like next?**

Share feedback through the application or contact the development team.

## What's Next?

### Potential Phase 3 Features

- Formula templates library
- Auto-suggestions for common formulas
- Formula history/favorites
- Collaborative formula editing
- Formula search and reuse

---

**Document Version**: 1.0
**Last Updated**: 2025-10-23
**Phase**: 2 (Hybrid Inline + Dialog)
**Status**: Released
