import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

import { SignUpVerifyForm } from '@/features/auth/components/SignUpVerifyForm';
import { FullPageLoading } from '@/components/shared/ui/FullPageLoading';

export default async function SignUpVerifyPage() {
  const t = await getTranslations('common');
  return (
    <Suspense fallback={<div className="py-16"><FullPageLoading text={t('loading', { default: 'Loading...' })} /></div>}>
      <SignUpVerifyForm />
    </Suspense>
  );
}
