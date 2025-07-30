'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InlineLoading } from '@/components/ui/loading-spinner';
import { UseFormReturn } from 'react-hook-form';
import { ProfileCompleteFormData } from '@/components/features/profile/hooks/useProfileComplete';
import { PersonalInfoSection } from './PersonalInfoSection';
import { SecuritySection } from './SecuritySection';
import { DefaultDashboardSelection } from './DefaultDashboardSelection';

interface ProfileCompleteFormProps {
  form: UseFormReturn<ProfileCompleteFormData>;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function ProfileCompleteForm({ form, isSubmitting, onSubmit }: ProfileCompleteFormProps) {
  const t = useTranslations();

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {t('auth.profileComplete.title', { default: 'Complete Your Profile' })}
          </CardTitle>
          <CardDescription>
            {t('auth.profileComplete.description', { default: 'Tell us about yourself to get started' })}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            <PersonalInfoSection form={form} isSubmitting={isSubmitting} />
            <SecuritySection form={form} isSubmitting={isSubmitting} />
            <DefaultDashboardSelection form={form} isSubmitting={isSubmitting} />

            <Button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <InlineLoading
                  text={t('auth.profileComplete.submitting', { default: 'Completing Profile...' })}
                />
              ) : (
                t('auth.profileComplete.submit', { default: 'Complete Profile' })
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}