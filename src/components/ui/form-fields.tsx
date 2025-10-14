import React from 'react';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';

import { useTranslations } from 'next-intl';

import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText } from '@/components/ui/input-group';
import { Eye, EyeOff } from 'lucide-react';

interface BaseFormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  disabled?: boolean;
}

export function PhoneField<T extends FieldValues>({
  control,
  name,
  disabled = false,
}: BaseFormFieldProps<T>) {
  const t = useTranslations();

  return (
    <Controller
      control={control}
      name={name as FieldPath<T>}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel htmlFor={String(name)}>
            {t('auth.phone.label', { default: 'Phone Number' })}
          </FieldLabel>
          <FieldContent>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <InputGroupText aria-hidden="true">+</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                id={String(name)}
                type="tel"
                placeholder={t('auth.phone.placeholder', {
                  default: '+1234567890',
                })}
                disabled={disabled}
                aria-invalid={!!fieldState.error}
                aria-describedby={fieldState.error ? `${String(name)}-error` : undefined}
                {...field}
              />
            </InputGroup>
            <FieldError id={`${String(name)}-error`}>{fieldState.error?.message}</FieldError>
          </FieldContent>
        </Field>
      )}
    />
  );
}

interface PasswordFieldProps<T extends FieldValues>
  extends BaseFormFieldProps<T> {
  placeholder?: string;
}

export function PasswordField<T extends FieldValues>({
  control,
  name,
  disabled = false,
  placeholder,
}: PasswordFieldProps<T>) {
  const t = useTranslations();
  const [show, setShow] = React.useState(false);

  return (
    <Controller
      control={control}
      name={name as FieldPath<T>}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel htmlFor={String(name)}>
            {t('auth.password.label', { default: 'Password' })}
          </FieldLabel>
          <FieldContent>
            <InputGroup>
              <InputGroupInput
                id={String(name)}
                type={show ? 'text' : 'password'}
                placeholder={
                  placeholder ||
                  t('auth.password.placeholder', {
                    default: 'Enter your password',
                  })
                }
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

interface TextFieldProps<T extends FieldValues> extends BaseFormFieldProps<T> {
  label: string;
  placeholder: string;
  type?: string;
}

export function TextField<T extends FieldValues>({
  control,
  name,
  disabled = false,
  label,
  placeholder,
  type = 'text',
}: TextFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name as FieldPath<T>}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel htmlFor={String(name)}>{label}</FieldLabel>
          <FieldContent>
            <Input
              id={String(name)}
              type={type}
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
