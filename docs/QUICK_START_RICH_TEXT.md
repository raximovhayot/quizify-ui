# Quick Start Guide - Rich Text Editor

## For Developers

### Using RichTextField in Forms

The easiest way to add rich text editing to your forms:

```tsx
import { RichTextField } from '@/components/shared/form/RichTextField';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define your schema
const schema = z.object({
  content: z.string().min(1, 'Content is required'),
  // ... other fields
});

function MyForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      content: '',
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <RichTextField
        control={form.control}
        name="content"
        label="Question Content"
        placeholder="Enter your question here..."
        required
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Using RichTextEditor Standalone

For more control, use the standalone editor:

```tsx
import { RichTextEditor } from '@/components/shared/form/RichTextEditor';
import { useState } from 'react';

function MyComponent() {
  const [content, setContent] = useState('');

  return (
    <RichTextEditor
      content={content}
      onChange={setContent}
      placeholder="Start typing..."
      minHeight="200px"
    />
  );
}
```

### Displaying Rich Text Content

To display formatted content:

```tsx
import { RichTextDisplay } from '@/components/shared/form/RichTextEditor';

function QuestionPreview({ question }) {
  return (
    <div>
      <h3>Question:</h3>
      <RichTextDisplay content={question.content} />
    </div>
  );
}
```

### Creating Responsive Modals

For mobile-responsive modals:

```tsx
import { useResponsive } from '@/components/shared/hooks/useResponsive';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetContent } from '@/components/ui/sheet';

function MyModal({ open, onOpenChange, children }) {
  const { isMobile } = useResponsive();

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh]">
          {children}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {children}
      </DialogContent>
    </Dialog>
  );
}
```

## Component Props Reference

### RichTextEditor

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| content | string | Yes | - | HTML content |
| onChange | (content: string) => void | Yes | - | Change handler |
| placeholder | string | No | "Start typing..." | Placeholder text |
| disabled | boolean | No | false | Disable editing |
| className | string | No | - | Additional classes |
| minHeight | string | No | "120px" | Minimum height |
| id | string | No | - | HTML id attribute |

### RichTextField

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| control | Control | Yes | - | RHF control object |
| name | string | Yes | - | Field name |
| label | string | Yes | - | Label text |
| placeholder | string | No | - | Placeholder text |
| minHeight | string | No | "120px" | Minimum height |
| disabled | boolean | No | false | Disable editing |
| required | boolean | No | false | Show required indicator |

### RichTextDisplay

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| content | string | Yes | - | HTML content to display |
| className | string | No | - | Additional classes |

## Toolbar Actions

The rich text editor includes these formatting options:

- **Bold** (Ctrl/Cmd + B): `editor.chain().focus().toggleBold().run()`
- **Italic** (Ctrl/Cmd + I): `editor.chain().focus().toggleItalic().run()`
- **Code**: `editor.chain().focus().toggleCode().run()`
- **Bullet List**: `editor.chain().focus().toggleBulletList().run()`
- **Ordered List**: `editor.chain().focus().toggleOrderedList().run()`
- **Undo** (Ctrl/Cmd + Z): `editor.chain().focus().undo().run()`
- **Redo** (Ctrl/Cmd + Shift + Z): `editor.chain().focus().redo().run()`

## Styling

The editor uses Tailwind's prose classes. Custom styles are in `src/app/globals.css`:

```css
/* Editor container */
.ProseMirror {
  @apply focus:outline-none;
}

/* Placeholder */
.ProseMirror p.is-editor-empty:first-child::before {
  @apply text-muted-foreground;
  content: attr(data-placeholder);
}

/* Prose styles for display */
.prose {
  @apply text-foreground;
}

.prose strong {
  @apply font-semibold;
}

.prose code {
  @apply bg-muted px-1.5 py-0.5 rounded text-sm font-mono;
}

/* Lists */
.prose ul {
  @apply list-disc pl-6;
}

.prose ol {
  @apply list-decimal pl-6;
}
```

## Validation

The editor works seamlessly with Zod validation:

```tsx
import { z } from 'zod';

const questionSchema = z.object({
  content: z
    .string()
    .min(10, 'Question must be at least 10 characters')
    .max(1000, 'Question must not exceed 1000 characters'),
  explanation: z
    .string()
    .max(500, 'Explanation must not exceed 500 characters')
    .optional(),
});

type QuestionForm = z.infer<typeof questionSchema>;
```

## Accessibility

The editor is fully accessible:

```tsx
// All toolbar buttons have ARIA labels
<button aria-label="Bold">
  <BoldIcon />
</button>

// Editor content is properly labeled
<div
  role="textbox"
  aria-label="Question content editor"
  contentEditable
>
  {/* Editor content */}
</div>
```

## Mobile Considerations

### Touch Targets

Ensure all interactive elements meet minimum size:

```tsx
// Toolbar buttons are at least 44x44px
<Button
  size="sm"
  className="h-8 w-8 p-0"  // 32px with 12px total padding = 44px tap target
>
  <Icon />
</Button>
```

### Safe Area

For bottom sheets on notched devices:

```tsx
<SheetContent className="pb-safe">
  {/* Content */}
</SheetContent>
```

The `.pb-safe` class adds padding for safe areas:

```css
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .pb-safe {
    padding-bottom: max(2rem, env(safe-area-inset-bottom));
  }
}
```

## Common Patterns

### Auto-save Draft

```tsx
import { useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

function QuestionForm() {
  const [content, setContent] = useState('');
  const debouncedContent = useDebounce(content, 1000);

  useEffect(() => {
    // Save to localStorage or API
    localStorage.setItem('draft', debouncedContent);
  }, [debouncedContent]);

  return (
    <RichTextEditor
      content={content}
      onChange={setContent}
    />
  );
}
```

### Character Counter

```tsx
import { stripHtml } from '@/components/shared/form/RichTextEditor';

function QuestionForm() {
  const [content, setContent] = useState('');
  const plainText = stripHtml(content);
  const charCount = plainText.length;

  return (
    <div>
      <RichTextEditor
        content={content}
        onChange={setContent}
      />
      <p className="text-sm text-muted-foreground">
        {charCount} / 1000 characters
      </p>
    </div>
  );
}
```

### Conditional Toolbar

```tsx
function ConditionalEditor({ simple = false }) {
  // For simple mode, you could create a minimal toolbar variant
  // or disable certain buttons programmatically
  
  return (
    <RichTextEditor
      content={content}
      onChange={setContent}
      // Custom configuration could go here
    />
  );
}
```

## Testing

### Unit Tests

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RichTextEditor } from '@/components/shared/form/RichTextEditor';

test('editor allows text formatting', async () => {
  const onChange = jest.fn();
  render(<RichTextEditor content="" onChange={onChange} />);

  const boldButton = screen.getByLabelText('Bold');
  await userEvent.click(boldButton);

  // Type text
  const editor = screen.getByRole('textbox');
  await userEvent.type(editor, 'Bold text');

  expect(onChange).toHaveBeenCalledWith(
    expect.stringContaining('<strong>Bold text</strong>')
  );
});
```

### Integration Tests

```tsx
test('form submission with rich text', async () => {
  const onSubmit = jest.fn();
  render(<QuestionForm onSubmit={onSubmit} />);

  const editor = screen.getByLabelText('Question Content');
  await userEvent.type(editor, 'My question');

  const submitButton = screen.getByRole('button', { name: /submit/i });
  await userEvent.click(submitButton);

  expect(onSubmit).toHaveBeenCalledWith({
    content: expect.stringContaining('My question'),
  });
});
```

## Troubleshooting

### Editor not showing

Make sure Tiptap styles are imported in `globals.css`:

```css
.ProseMirror {
  @apply focus:outline-none;
}
```

### Content not updating

Ensure you're using the controlled component pattern:

```tsx
// ✅ Correct
const [content, setContent] = useState('');
<RichTextEditor content={content} onChange={setContent} />

// ❌ Incorrect
<RichTextEditor content="initial" onChange={console.log} />
```

### Mobile keyboard issues

For better mobile keyboard handling, use appropriate input modes:

```tsx
<div
  contentEditable
  inputMode="text"
  enterKeyHint="done"
>
  {/* Editor content */}
</div>
```

## Further Resources

- [Tiptap Documentation](https://tiptap.dev/docs)
- [React Hook Form Guide](https://react-hook-form.com/get-started)
- [Tailwind Typography](https://tailwindcss.com/docs/typography-plugin)
- [Mobile Web Best Practices](https://web.dev/mobile/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
