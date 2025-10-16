import { Controller, UseFormReturn } from 'react-hook-form';

import { useTranslations } from 'next-intl';

import { ProfileCompleteFormData } from '@/features/profile/hooks/useProfileComplete';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

interface SecuritySectionProps {
  form: UseFormReturn<ProfileCompleteFormData>;
  isSubmitting: boolean;
}

export function SecuritySection({
  form,
  isSubmitting,
}: Readonly<SecuritySectionProps>) {
  const t = useTranslations();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">
        {t('auth.profileComplete.security', { default: 'Security' })}
      </h3>

      <Controller
        control={form.control}
        name="password"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="password">
              {t('auth.password.label', { default: 'Password' })}
            </FieldLabel>
            <FieldContent>
              <Input
                id="password"
                type="password"
                placeholder={t('auth.password.placeholder', {
                  default: 'Create a password',
                })}
                disabled={isSubmitting}
                aria-invalid={!!fieldState.error}
                aria-describedby={fieldState.error ? 'password-error' : undefined}
                {...field}
              />
              <FieldError id="password-error">{fieldState.error?.message}</FieldError>
            </FieldContent>
            <div className="text-sm text-muted-foreground mt-2">
              <p>
                {t('auth.profileComplete.passwordRequirements', {
                  default: 'Password must contain at least:',
                })}
              </p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>
                  {t('auth.profileComplete.passwordLength', {
                    default: '8 characters minimum',
                  })}
                </li>
                <li>
                  {t('auth.profileComplete.passwordUppercase', {
                    default: 'One uppercase letter',
                  })}
                </li>
                <li>
                  {t('auth.profileComplete.passwordLowercase', {
                    default: 'One lowercase letter',
                  })}
                </li>
                <li>
                  {t('auth.profileComplete.passwordNumber', {
                    default: 'One number',
                  })}
                </li>
              </ul>
            </div>
          </Field>
        )}
      />
    </div>
  );
}
