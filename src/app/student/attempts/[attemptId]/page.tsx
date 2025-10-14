import { Suspense } from 'react';

import { FullPageLoading } from '@/components/shared/ui/FullPageLoading';
import AttemptPlayerClient from './attempt-player-client';

interface PageProps {
  params: { attemptId: string };
}

export default function AttemptPage({ params }: PageProps) {
  const id = Number(params.attemptId);
  // Basic guard; rendering client will handle loading/errors.
  if (!Number.isFinite(id) || id <= 0) {
    return null;
  }
  return (
    <Suspense fallback={<FullPageLoading />}>
      <AttemptPlayerClient attemptId={id} />
    </Suspense>
  );
}
