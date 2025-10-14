import { Suspense } from 'react';

import { notFound } from 'next/navigation';

import { FullPageLoading } from '@/components/shared/ui/FullPageLoading';
import { QuizViewClient } from './quiz-view-client';

export default function StudentQuizPage({
  params,
}: {
  params: { quizId: string };
}) {
  const id = Number(params.quizId);
  if (!Number.isFinite(id) || id <= 0) return notFound();

  return (
    <Suspense fallback={<FullPageLoading />}>
      <QuizViewClient quizId={id} />
    </Suspense>
  );
}
