import { useTranslations } from 'next-intl';
import { UseFormReturn } from 'react-hook-form';

import { ProfileCompleteFormData } from '@/components/features/profile/hooks/useProfileComplete';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface SecuritySectionProps {
  form: UseFormReturn<ProfileCompleteFormData>;
  isSubmitting: boolean;
}

export function SecuritySection({ form, isSubmitting }: SecuritySectionProps) {
  const t = useTranslations();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">
        {t('auth.profileComplete.security', { default: 'Security' })}
      </h3>

      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t('auth.password.label', { default: 'Password' })}
            </FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder={t('auth.password.placeholder', {
                  default: 'Create a password',
                })}
                disabled={isSubmitting}
                {...field}
              />
            </FormControl>
            <FormMessage />
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
          </FormItem>
        )}
      />
    </div>
  );
}
