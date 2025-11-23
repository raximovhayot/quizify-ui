import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';
import { FullPageLoading } from '@/components/custom-ui/FullPageLoading';

export default async function ResetPasswordPage() {
  const t = await getTranslations('common');
  return (
    <Suspense fallback={<div className="py-16"><FullPageLoading text={t('loading', { default: 'Loading...' })} /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
