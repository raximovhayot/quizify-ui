import React from 'react';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface PhoneFieldProps {
  control: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  name: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Reusable PhoneField component for phone number inputs
 *
 * Wraps a phone input field with consistent FormField structure including
 * label, control, and validation message display.
 *
 * @example
 * ```tsx
 * <PhoneField
 *   control={form.control}
 *   name="phone"
 *   label="Phone Number"
 *   placeholder="+1234567890"
 *   disabled={isSubmitting}
 * />
 * ```
 */
export function PhoneField({
  control,
  name,
  label,
  placeholder = '+1234567890',
  disabled = false,
}: PhoneFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="tel"
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

export default PhoneField;
