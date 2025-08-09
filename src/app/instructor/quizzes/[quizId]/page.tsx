'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';

export default function ViewQuizPage() {
  const t = useTranslations();
  const params = useParams<{ quizId: string }>();
  const quizId = params?.quizId;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {t('instructor.quiz.view.title', {
            id: quizId,
            fallback: 'Quiz Details (stub) — {id}',
          })}
        </h1>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/instructor/quizzes">
              {t('common.back', { fallback: 'Back to list' })}
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/instructor/quizzes/${quizId}/edit`}>
              {t('common.edit', { fallback: 'Edit' })}
            </Link>
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground">
        {t('instructor.quiz.view.description', {
          id: quizId,
          fallback:
            'This is a placeholder page for viewing quiz {id}. The full details view will be implemented soon.',
        })}
      </p>
    </div>
  );
}
