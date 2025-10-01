import React from 'react';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface PasswordFieldProps {
  control: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  name: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Reusable PasswordField component for password inputs
 *
 * Wraps a password input field with consistent FormField structure including
 * label, control, and validation message display.
 *
 * @example
 * ```tsx
 * <PasswordField
 *   control={form.control}
 *   name="password"
 *   label="Password"
 *   placeholder="Enter your password"
 *   disabled={isSubmitting}
 * />
 * ```
 */
export function PasswordField({
  control,
  name,
  label,
  placeholder = 'Enter your password',
  disabled = false,
}: PasswordFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="password"
              placeholder={placeholder}
              disabled={disabled}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default PasswordField;
