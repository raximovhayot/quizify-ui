'use client';

import {
  Control,
  FieldPath,
  FieldValues,
  useController,
} from 'react-hook-form';

import { Label } from '@/components/ui/label';

import { RichTextEditor } from './RichTextEditor';

export interface RichTextFieldProps<
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

export function RichTextField<
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
}: RichTextFieldProps<TFieldValues, TName>) {
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
      <RichTextEditor
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
