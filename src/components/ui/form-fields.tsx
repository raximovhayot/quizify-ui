import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

interface BaseFormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  disabled?: boolean;
}

export function PhoneField<T extends FieldValues>({ 
  control, 
  name, 
  disabled = false 
}: BaseFormFieldProps<T>) {
  const t = useTranslations();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {t('auth.phone.label', { default: 'Phone Number' })}
          </FormLabel>
          <FormControl>
            <Input
              type="tel"
              placeholder={t('auth.phone.placeholder', { default: '+1234567890' })}
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

interface PasswordFieldProps<T extends FieldValues> extends BaseFormFieldProps<T> {
  placeholder?: string;
}

export function PasswordField<T extends FieldValues>({ 
  control, 
  name, 
  disabled = false,
  placeholder 
}: PasswordFieldProps<T>) {
  const t = useTranslations();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {t('auth.password.label', { default: 'Password' })}
          </FormLabel>
          <FormControl>
            <Input
              type="password"
              placeholder={placeholder || t('auth.password.placeholder', { default: 'Enter your password' })}
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
  type = 'text'
}: TextFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
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