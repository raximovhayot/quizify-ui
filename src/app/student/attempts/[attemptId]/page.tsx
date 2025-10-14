import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

import { FullPageLoading } from '@/components/shared/ui/FullPageLoading';
import AttemptPlayerClient from './attempt-player-client';

interface PageProps {
  params: { attemptId: string };
}

export default async function AttemptPage({ params }: PageProps) {
  const id = Number(params.attemptId);
  // Basic guard; rendering client will handle loading/errors.
  if (!Number.isFinite(id) || id <= 0) {
    return null;
  }
  const t = await getTranslations('common');
  return (
    <Suspense fallback={<FullPageLoading text={t('loading', { default: 'Loading...' })} />}>
      <AttemptPlayerClient attemptId={id} />
    </Suspense>
  );
}
