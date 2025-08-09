'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';

export default function EditQuizPage() {
  const t = useTranslations();
  const params = useParams<{ quizId: string }>();
  const quizId = params?.quizId;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {t('instructor.quiz.edit.title', {
            id: quizId,
            fallback: 'Edit Quiz (stub) — {id}',
          })}
        </h1>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href={`/instructor/quizzes/${quizId}`}>
              {t('common.view', { fallback: 'View' })}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/instructor/quizzes">
              {t('common.back', { fallback: 'Back to list' })}
            </Link>
          </Button>
        </div>
      </div>
      <p className="text-muted-foreground">
        {t('instructor.quiz.edit.description', {
          id: quizId,
          fallback:
            'This is a placeholder page for editing quiz {id}. The full edit form will be implemented soon.',
        })}
      </p>
    </div>
  );
}
