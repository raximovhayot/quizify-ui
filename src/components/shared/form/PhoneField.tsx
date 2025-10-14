import React from 'react';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';

import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupInput } from '@/components/ui/input-group';

interface PhoneFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  // Future-proofing: currently only Uzbekistan is enabled. When more are allowed, expand this.
  allowedCountries?: Array<'UZ'>;
  defaultCountry?: 'UZ';
}

// Utilities for Uzbekistan phone numbers
function digitsOnly(value: string): string {
  return value.replace(/\D+/g, '');
}

function formatUzbekDisplay(e164OrPartial: string): string {
  // Expect values like "", "+998", or "+998" + up to 9 digits
  // Returns ONLY the national part formatted as "XX XXX XX XX" (no +998),
  // because the "+998" prefix is rendered separately in the addon.
  const digits = digitsOnly(e164OrPartial);
  let national = '';
  if (digits.startsWith('998')) {
    national = digits.slice(3, 12);
  } else {
    // If user typed local form, treat it as national directly
    national = digits.slice(0, 9);
  }
  const chunks: string[] = [];
  if (national.length > 0) {
    const a = national.slice(0, 2); // operator
    const b = national.slice(2, 5);
    const c = national.slice(5, 7);
    const d = national.slice(7, 9);
    if (a) chunks.push(a);
    if (b) chunks.push(b);
    if (c) chunks.push(c);
    if (d) chunks.push(d);
  }
  return chunks.join(' ');
}

function normalizeUzbekToE164(input: string): string {
  const digits = digitsOnly(input);
  let national = '';
  if (digits.startsWith('998')) {
    national = digits.slice(3, 12);
  } else {
    national = digits.slice(0, 9);
  }
  if (national.length === 0) return '';
  return '+998' + national;
}

/**
 * Reusable PhoneField component for phone number inputs
 *
 * Extended for Uzbekistan-only numbers with automatic formatting/masking.
 * - Displays as "+998 XX XXX XX XX" while storing normalized E.164 "+998XXXXXXXXX".
 * - Country selector is visually present but fixed to 🇺🇿 +998 (non-interactive for now).
 */
export function PhoneField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = '90 123 45 67',
  disabled = false,
  allowedCountries = ['UZ'],
  defaultCountry = 'UZ',
}: PhoneFieldProps<T>) {
  // currently only 'UZ' is supported; props reserved for future flexibility
  const isUzOnly = allowedCountries.length === 1 && allowedCountries[0] === 'UZ' && defaultCountry === 'UZ';

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const displayValue = field.value ? formatUzbekDisplay(String(field.value)) : '';
        return (
          <Field>
            <FieldLabel htmlFor={String(name)}>{label}</FieldLabel>
            <FieldContent>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <InputGroupText aria-hidden="true">{isUzOnly ? '🇺🇿' : ''}</InputGroupText>
                  <InputGroupText aria-hidden="true">+998</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id={String(name)}
                  type="tel"
                  inputMode="tel"
                  placeholder={placeholder}
                  disabled={disabled}
                  aria-invalid={!!fieldState.error}
                  aria-describedby={fieldState.error ? `${String(name)}-error` : undefined}
                  value={displayValue}
                  onChange={(e) => {
                    const normalized = normalizeUzbekToE164(e.target.value);
                    field.onChange(normalized);
                  }}
                  onBlur={field.onBlur}
                />
              </InputGroup>
              <FieldError id={`${String(name)}-error`}>{fieldState.error?.message}</FieldError>
            </FieldContent>
          </Field>
        );
      }}
    />
  );
}

export default PhoneField;
