import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { ZodSchema } from 'zod';

import { BackendError } from '@/types/api';

/**
 * Form configuration options with enhanced type safety
 */
export interface FormConfig<T extends FieldValues> {
  schema: ZodSchema<T>;
  defaultValues: T;
  mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all';
  validateOnMount?: boolean;
  reValidateMode?: 'onChange' | 'onBlur' | 'onSubmit';
}

/**
 * Strict form field names type - ensures only valid field names can be used
 */
export type StrictFieldPath<T extends FieldValues> = {
  [K in keyof T]: T[K] extends object
    ? K extends string
      ? `${K}` | `${K}.${StrictFieldPath<T[K]>}`
      : never
    : K extends string
      ? K
      : never;
}[keyof T];

/**
 * Type-safe form field configuration
 */
export interface TypedFormField<
  T extends FieldValues,
  K extends StrictFieldPath<T>,
> {
  name: K;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  description?: string;
  validation?: {
    required?: string;
    pattern?: { value: RegExp; message: string };
    minLength?: { value: number; message: string };
    maxLength?: { value: number; message: string };
    min?: { value: number; message: string };
    max?: { value: number; message: string };
    validate?: (value: unknown) => string | boolean;
  };
}

/**
 * Form field error helper
 * Extracts error message for a specific field from form state or backend error
 */
export function getFieldError<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldName: Path<T>,
  backendError?: BackendError
): string | undefined {
  // Check form validation errors first
  const formError = form.formState.errors[fieldName];
  if (formError?.message) {
    return formError.message as string;
  }

  // Check backend field errors
  if (backendError) {
    const fieldErrors = backendError.getFieldErrors(fieldName as string);
    if (fieldErrors.length > 0) {
      return fieldErrors[0]?.message;
    }
  }

  return undefined;
}

/**
 * Check if a field has any errors (form validation or backend)
 */
export function hasFieldError<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldName: Path<T>,
  backendError?: BackendError
): boolean {
  return !!getFieldError(form, fieldName, backendError);
}

/**
 * Get all field errors for display
 */
export function getAllFieldErrors<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldName: Path<T>,
  backendError?: BackendError
): string[] {
  const errors: string[] = [];

  // Add form validation error
  const formError = form.formState.errors[fieldName];
  if (formError?.message) {
    errors.push(formError.message as string);
  }

  // Add backend field errors
  if (backendError) {
    const fieldErrors = backendError.getFieldErrors(fieldName as string);
    errors.push(...fieldErrors.map((err) => err.message));
  }

  return errors;
}

/**
 * Clear form errors for specific fields
 */
export function clearFieldErrors<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldNames: Path<T>[]
): void {
  fieldNames.forEach((fieldName) => {
    form.clearErrors(fieldName);
  });
}

/**
 * Set backend errors on form fields
 */
export function setBackendErrors<T extends FieldValues>(
  form: UseFormReturn<T>,
  backendError: BackendError
): void {
  backendError.errors.forEach((error) => {
    if (error.field) {
      form.setError(error.field as Path<T>, {
        type: 'backend',
        message: error.message,
      });
    }
  });
}

/**
 * Form submission helper that handles backend errors
 */
export async function handleFormSubmission<T extends FieldValues>(
  form: UseFormReturn<T>,
  submitFn: (data: T) => Promise<void>,
  onSuccess?: (data: T) => void
): Promise<void> {
  try {
    const data = form.getValues();
    await submitFn(data);

    if (onSuccess) {
      onSuccess(data);
    }
  } catch (error) {
    if (error instanceof BackendError) {
      setBackendErrors(form, error);
    }
    throw error; // Re-throw to allow component to handle it
  }
}

/**
 * Common form field props interface
 */
export interface FormFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  backendError?: BackendError;
}

/**
 * Get common form field props
 */
export function getFormFieldProps<T extends FieldValues>(
  props: FormFieldProps<T>
) {
  const { form, name, backendError, ...rest } = props;

  return {
    ...rest,
    error: getFieldError(form, name, backendError),
    hasError: hasFieldError(form, name, backendError),
    ...form.register(name),
  };
}

/**
 * Form state helpers
 */
export const formStateHelpers = {
  /**
   * Check if form is currently submitting
   */
  isSubmitting: <T extends FieldValues>(form: UseFormReturn<T>) =>
    form.formState.isSubmitting,

  /**
   * Check if form has any errors
   */
  hasErrors: <T extends FieldValues>(form: UseFormReturn<T>) =>
    Object.keys(form.formState.errors).length > 0,

  /**
   * Check if form is valid
   */
  isValid: <T extends FieldValues>(form: UseFormReturn<T>) =>
    form.formState.isValid,

  /**
   * Check if form has been touched
   */
  isTouched: <T extends FieldValues>(form: UseFormReturn<T>) =>
    Object.keys(form.formState.touchedFields).length > 0,

  /**
   * Check if form is dirty (has changes)
   */
  isDirty: <T extends FieldValues>(form: UseFormReturn<T>) =>
    form.formState.isDirty,
};

/**
 * Form validation helpers
 */
export const formValidationHelpers = {
  /**
   * Trigger validation for specific fields
   */
  validateFields: async <T extends FieldValues>(
    form: UseFormReturn<T>,
    fieldNames: Path<T>[]
  ) => {
    const results = await Promise.all(
      fieldNames.map((fieldName) => form.trigger(fieldName))
    );
    return results.every((result) => result);
  },

  /**
   * Validate entire form
   */
  validateForm: async <T extends FieldValues>(form: UseFormReturn<T>) => {
    return await form.trigger();
  },
};
