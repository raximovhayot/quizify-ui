import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';
import { FullPageLoading } from '@/components/custom-ui/FullPageLoading';

export default async function ForgotPasswordPage() {
  const t = await getTranslations('common');
  return (
    <Suspense fallback={<div className="py-16"><FullPageLoading text={t('loading', { default: 'Loading...' })} /></div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
