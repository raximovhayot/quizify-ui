import { UseFormReturn } from 'react-hook-form';

import { useTranslations } from 'next-intl';

import { ProfileCompleteFormData } from '@/features/profile/hooks/useProfileComplete';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

import { DefaultDashboardSelection } from './DefaultDashboardSelection';
import { PersonalInfoSection } from './PersonalInfoSection';
import { SecuritySection } from './SecuritySection';

interface ProfileCompleteFormProps {
  form: UseFormReturn<ProfileCompleteFormData>;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function ProfileCompleteForm({
  form,
  isSubmitting,
  onSubmit,
}: Readonly<ProfileCompleteFormProps>) {
  const t = useTranslations();

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {t('auth.profileComplete.title', {
              default: 'Complete Your Profile',
            })}
          </CardTitle>
          <CardDescription>
            {t('auth.profileComplete.description', {
              default: 'Tell us about yourself to get started',
            })}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            <PersonalInfoSection form={form} isSubmitting={isSubmitting} />
            <SecuritySection form={form} isSubmitting={isSubmitting} />
            <DefaultDashboardSelection
              form={form}
              isSubmitting={isSubmitting}
            />

            <Button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="size-4 mr-2" />
                  {t('auth.profileComplete.submitting', {
                    default: 'Completing Profile...',
                  })}
                </>
              ) : (
                t('auth.profileComplete.submit', {
                  default: 'Complete Profile',
                })
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
