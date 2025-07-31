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

interface PersonalInfoSectionProps {
  form: UseFormReturn<ProfileCompleteFormData>;
  isSubmitting: boolean;
}

export function PersonalInfoSection({
  form,
  isSubmitting,
}: PersonalInfoSectionProps) {
  const t = useTranslations();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">
        {t('auth.profileComplete.personalInfo', {
          default: 'Personal Information',
        })}
      </h3>

      <FormField
        control={form.control}
        name="firstName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t('auth.firstName.label', { default: 'First Name' })}
            </FormLabel>
            <FormControl>
              <Input
                placeholder={t('auth.firstName.placeholder', {
                  default: 'Enter your first name',
                })}
                disabled={isSubmitting}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="lastName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t('auth.lastName.label', { default: 'Last Name' })}
            </FormLabel>
            <FormControl>
              <Input
                placeholder={t('auth.lastName.placeholder', {
                  default: 'Enter your last name',
                })}
                disabled={isSubmitting}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
