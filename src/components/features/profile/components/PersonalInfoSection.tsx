import { Controller, UseFormReturn } from 'react-hook-form';

import { useTranslations } from 'next-intl';

import { ProfileCompleteFormData } from '@/components/features/profile/hooks/useProfileComplete';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

interface PersonalInfoSectionProps {
  form: UseFormReturn<ProfileCompleteFormData>;
  isSubmitting: boolean;
}

export function PersonalInfoSection({
  form,
  isSubmitting,
}: Readonly<PersonalInfoSectionProps>) {
  const t = useTranslations();

  return (
    <div className="space-y-4">
      <Controller
        control={form.control}
        name="firstName"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="firstName">
              {t('auth.firstName.label', { default: 'First Name' })}
            </FieldLabel>
            <FieldContent>
              <Input
                id="firstName"
                placeholder={t('auth.firstName.placeholder', {
                  default: 'Enter your first name',
                })}
                disabled={isSubmitting}
                aria-invalid={!!fieldState.error}
                aria-describedby={fieldState.error ? 'firstName-error' : undefined}
                {...field}
              />
              <FieldError id="firstName-error">{fieldState.error?.message}</FieldError>
            </FieldContent>
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="lastName"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="lastName">
              {t('auth.lastName.label', { default: 'Last Name' })}
            </FieldLabel>
            <FieldContent>
              <Input
                id="lastName"
                placeholder={t('auth.lastName.placeholder', {
                  default: 'Enter your last name',
                })}
                disabled={isSubmitting}
                aria-invalid={!!fieldState.error}
                aria-describedby={fieldState.error ? 'lastName-error' : undefined}
                {...field}
              />
              <FieldError id="lastName-error">{fieldState.error?.message}</FieldError>
            </FieldContent>
          </Field>
        )}
      />
    </div>
  );
}
