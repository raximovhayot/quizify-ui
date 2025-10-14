import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

import { notFound } from 'next/navigation';

import { FullPageLoading } from '@/components/shared/ui/FullPageLoading';
import { QuizViewClient } from './quiz-view-client';

export default async function StudentQuizPage({
  params,
}: {
  params: { quizId: string };
}) {
  const id = Number(params.quizId);
  if (!Number.isFinite(id) || id <= 0) return notFound();
  const t = await getTranslations('common');

  return (
    <Suspense fallback={<FullPageLoading text={t('loading', { default: 'Loading...' })} />}>
      <QuizViewClient quizId={id} />
    </Suspense>
  );
}
