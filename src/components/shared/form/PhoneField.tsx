import React from 'react';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';

import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

interface PhoneFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Reusable PhoneField component for phone number inputs
 *
 * Now implemented with shadcn `field` primitives and RHF `Controller`.
 */
export function PhoneField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = '+1234567890',
  disabled = false,
}: PhoneFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel htmlFor={String(name)}>{label}</FieldLabel>
          <FieldContent>
            <Input
              id={String(name)}
              type="tel"
              placeholder={placeholder}
              disabled={disabled}
              aria-invalid={!!fieldState.error}
              aria-describedby={fieldState.error ? `${String(name)}-error` : undefined}
              {...field}
            />
            <FieldError id={`${String(name)}-error`}>{fieldState.error?.message}</FieldError>
          </FieldContent>
        </Field>
      )}
    />
  );
}

export default PhoneField;
