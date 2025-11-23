import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

import { SignUpForm } from '@/features/auth/components/SignUpForm';
import { FullPageLoading } from '@/components/custom-ui/FullPageLoading';

export default async function SignUpPage() {
  const t = await getTranslations('common');
  return (
    <Suspense fallback={<div className="py-16"><FullPageLoading text={t('loading', { default: 'Loading...' })} /></div>}>
      <SignUpForm />
    </Suspense>
  );
}
