import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

import { ForgotPasswordVerifyForm } from '@/features/auth/components/ForgotPasswordVerifyForm';
import { FullPageLoading } from '@/components/custom-ui/FullPageLoading';

export default async function ForgotPasswordVerifyPage() {
  const t = await getTranslations('common');
  return (
    <Suspense fallback={<div className="py-16"><FullPageLoading text={t('loading', { default: 'Loading...' })} /></div>}>
      <ForgotPasswordVerifyForm />
    </Suspense>
  );
}
