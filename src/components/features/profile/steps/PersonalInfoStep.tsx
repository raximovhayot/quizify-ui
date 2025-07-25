'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { ProfileCompleteFormData } from '@/hooks/useProfileComplete';

interface PersonalInfoStepProps {
  form: UseFormReturn<ProfileCompleteFormData>;
  isSubmitting: boolean;
}

export function PersonalInfoStep({ form, isSubmitting }: PersonalInfoStepProps) {
  const t = useTranslations();

  return (
    <div className="space-y-4">
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
                placeholder={t('auth.firstName.placeholder', { default: 'Enter your first name' })}
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
                placeholder={t('auth.lastName.placeholder', { default: 'Enter your last name' })}
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