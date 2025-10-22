'use client';

import {
  Control,
  FieldPath,
  FieldValues,
  useController,
} from 'react-hook-form';

import { Label } from '@/components/ui/label';

import { MinimalRichTextEditor } from './MinimalRichTextEditor';

export interface MinimalRichTextFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  placeholder?: string;
  minHeight?: string;
  disabled?: boolean;
  required?: boolean;
}

export function MinimalRichTextField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  placeholder,
  minHeight,
  disabled,
  required,
}: MinimalRichTextFieldProps<TFieldValues, TName>) {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  return (
    <div className="space-y-2">
      <Label htmlFor={String(name)}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <MinimalRichTextEditor
        id={String(name)}
        content={field.value || ''}
        onChange={field.onChange}
        placeholder={placeholder}
        disabled={disabled}
        minHeight={minHeight}
      />
      {error && (
        <p className="text-sm text-destructive mt-1">{error.message}</p>
      )}
    </div>
  );
}

// Create a default export that maintains the generics
export default MinimalRichTextField;
