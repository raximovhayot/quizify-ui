import React from 'react';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';

import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';

interface PasswordFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Reusable PasswordField implemented with shadcn `field` + `input-group`.
 * Includes a visibility toggle button.
 */
export function PasswordField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = 'Enter your password',
  disabled = false,
}: PasswordFieldProps<T>) {
  const [show, setShow] = React.useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel htmlFor={String(name)}>{label}</FieldLabel>
          <FieldContent>
            <InputGroup>
              <InputGroupInput
                id={String(name)}
                type={show ? 'text' : 'password'}
                placeholder={placeholder}
                disabled={disabled}
                aria-invalid={!!fieldState.error}
                aria-describedby={fieldState.error ? `${String(name)}-error` : undefined}
                {...field}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? 'Hide password' : 'Show password'}
                >
                  {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <FieldError id={`${String(name)}-error`}>{fieldState.error?.message}</FieldError>
          </FieldContent>
        </Field>
      )}
    />
  );
}

export default PasswordField;
