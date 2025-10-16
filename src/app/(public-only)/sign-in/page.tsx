import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

import { SignInForm } from '@/features/auth/components/SignInForm';
import { FullPageLoading } from '@/components/shared/ui/FullPageLoading';

export default async function SignInPage() {
  const t = await getTranslations('common');
  return (
    <Suspense fallback={<div className="py-16"><FullPageLoading text={t('loading', { default: 'Loading...' })} /></div>}>
      <SignInForm />
    </Suspense>
  );
}
