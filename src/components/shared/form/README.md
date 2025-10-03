# Reusable Form Components

This directory contains reusable form components that provide consistent patterns for building forms throughout the application.

## Components

### FormCard

A standardized card layout for forms with title, optional description, and content area.

**Props:**

- `title` (string, required): The card title
- `description` (string, optional): Optional description below the title
- `children` (ReactNode, required): Form content
- `className` (string, optional): Additional CSS classes
- `centerHeader` (boolean, optional): Center the header text (default: false)

**Example:**

```tsx
import { FormCard } from '@/components/shared/form';

<FormCard title="Sign In" description="Enter your credentials" centerHeader>
  <form>{/* Form fields */}</form>
</FormCard>;
```

**Usage:**

- Auth forms (SignIn, SignUp, ForgotPassword, ResetPassword)
- Profile forms (UpdatePassword, UpdateDetails)
- Any form that needs consistent card styling

---

### PasswordField

A reusable password input field with built-in label, validation, and error display.

**Props:**

- `control` (any, required): React Hook Form control object
- `name` (string, required): Field name in the form
- `label` (string, required): Label text
- `placeholder` (string, optional): Placeholder text (default: "Enter your password")
- `disabled` (boolean, optional): Disable the input (default: false)

**Example:**

```tsx
import { useForm } from 'react-hook-form';

import { PasswordField } from '@/components/shared/form';

const form = useForm();

<PasswordField
  control={form.control}
  name="password"
  label="Password"
  placeholder="Enter your password"
  disabled={isSubmitting}
/>;
```

**Usage:**

- Sign in forms
- Sign up forms
- Password reset forms
- Profile password update forms

**Benefits:**

- Eliminates 10+ lines of boilerplate per password field
- Consistent password field styling and behavior
- Built-in validation message display

---

### PhoneField

A reusable phone number input field with built-in label, validation, and error display.

**Props:**

- `control` (any, required): React Hook Form control object
- `name` (string, required): Field name in the form
- `label` (string, required): Label text
- `placeholder` (string, optional): Placeholder text (default: "+1234567890")
- `disabled` (boolean, optional): Disable the input (default: false)

**Example:**

```tsx
import { useForm } from 'react-hook-form';

import { PhoneField } from '@/components/shared/form';

const form = useForm();

<PhoneField
  control={form.control}
  name="phone"
  label="Phone Number"
  placeholder="+1234567890"
  disabled={isSubmitting}
/>;
```

**Usage:**

- Sign in forms
- Sign up forms
- Forgot password forms
- Any form requiring phone input

**Benefits:**

- Eliminates 10+ lines of boilerplate per phone field
- Consistent phone field styling with `type="tel"`
- Built-in validation message display

---

## Best Practices

1. **Use FormCard for all forms**: Provides consistent card styling across the app
2. **Use field components for common inputs**: PasswordField and PhoneField reduce boilerplate
3. **Pass translations**: Always pass translated strings for labels and placeholders
4. **Handle loading states**: Use the `disabled` prop to disable fields during submission

## Migration Guide

### Before (Old Pattern)

```tsx
<Card>
  <CardHeader className="text-center">
    <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
    <CardDescription>Enter your credentials</CardDescription>
  </CardHeader>
  <CardContent>
    <Form {...form}>
      <form onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  </CardContent>
</Card>
```

### After (New Pattern)

```tsx
<FormCard title="Sign In" description="Enter your credentials" centerHeader>
  <Form {...form}>
    <form onSubmit={onSubmit}>
      <PasswordField
        control={form.control}
        name="password"
        label="Password"
        placeholder="Enter your password"
      />
    </form>
  </Form>
</FormCard>
```

**Result**: Reduced from ~30 lines to ~15 lines (50% reduction)

---

### RichTextEditor

A rich text editor built with Tiptap that provides formatting capabilities for content creation.

**Features:**

- Text formatting: Bold, Italic, Code
- Lists: Bullet lists, Ordered lists
- Undo/Redo support
- Placeholder support
- Disabled state
- Responsive toolbar
- Dark mode support

**Props:**

- `content: string` - HTML content to display/edit
- `onChange: (content: string) => void` - Callback when content changes
- `placeholder?: string` - Placeholder text
- `disabled?: boolean` - Disable editing
- `className?: string` - Additional CSS classes
- `minHeight?: string` - Minimum height (default: "120px")
- `id?: string` - HTML id attribute

**Example:**

```tsx
import { RichTextEditor } from '@/components/shared/form/RichTextEditor';

function MyComponent() {
  const [content, setContent] = useState('');

  return (
    <RichTextEditor
      content={content}
      onChange={setContent}
      placeholder="Start typing..."
      minHeight="150px"
    />
  );
}
```

**Usage:**

- Question content editing
- Quiz descriptions
- Explanations and feedback
- Any text that needs rich formatting

---

### RichTextField

A React Hook Form compatible wrapper for RichTextEditor.

**Props:**

- `control: Control` - React Hook Form control
- `name: string` - Field name
- `label: string` - Label text
- `placeholder?: string` - Placeholder text
- `minHeight?: string` - Minimum height
- `disabled?: boolean` - Disable editing
- `required?: boolean` - Show required indicator

**Example:**

```tsx
import { useForm } from 'react-hook-form';

import { RichTextField } from '@/components/shared/form/RichTextField';

function MyForm() {
  const { control } = useForm();

  return (
    <RichTextField
      control={control}
      name="content"
      label="Question Content"
      placeholder="Enter your question..."
      required
    />
  );
}
```

**Usage:**

- Integrated with React Hook Form
- Automatic validation and error display
- Used in question creation/editing forms

---

### RichTextDisplay

A read-only component to display rich text content with proper styling.

**Props:**

- `content: string` - HTML content to display
- `className?: string` - Additional CSS classes

**Example:**

```tsx
import { RichTextDisplay } from '@/components/shared/form/RichTextEditor';

function QuestionPreview({ content }) {
  return <RichTextDisplay content={content} />;
}
```

**Usage:**

- Question previews
- Display formatted content anywhere in the app

---

### stripHtml

A utility function to extract plain text from HTML content.

**Example:**

```tsx
import { stripHtml } from '@/components/shared/form/RichTextEditor';

const plainText = stripHtml('<p>Hello <strong>world</strong></p>');
// Output: "Hello world"
```

**Usage:**

- Preview snippets
- Search indexing
- Plain text fallbacks

---

## Rich Text Styling

The rich text editor uses Tailwind's prose classes. Custom styles are in `src/app/globals.css`:

- `.ProseMirror` - Editor container styles
- `.prose` - Rich text display styles
- Custom placeholder styles for empty editor

## Mobile Support

All components are fully responsive:

- Touch-friendly toolbar buttons
- Optimized button sizes for mobile
- Responsive toolbar layout with wrapping
- Proper focus handling on mobile keyboards

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader compatible
- Proper focus management
- Semantic HTML output
