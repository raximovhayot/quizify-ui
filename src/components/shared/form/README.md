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

<FormCard 
  title="Sign In" 
  description="Enter your credentials"
  centerHeader
>
  <form>
    {/* Form fields */}
  </form>
</FormCard>
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
import { PasswordField } from '@/components/shared/form';
import { useForm } from 'react-hook-form';

const form = useForm();

<PasswordField
  control={form.control}
  name="password"
  label="Password"
  placeholder="Enter your password"
  disabled={isSubmitting}
/>
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
import { PhoneField } from '@/components/shared/form';
import { useForm } from 'react-hook-form';

const form = useForm();

<PhoneField
  control={form.control}
  name="phone"
  label="Phone Number"
  placeholder="+1234567890"
  disabled={isSubmitting}
/>
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
<FormCard 
  title="Sign In" 
  description="Enter your credentials"
  centerHeader
>
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
