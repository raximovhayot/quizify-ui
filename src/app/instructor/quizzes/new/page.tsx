'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function NewQuizPage() {
  const t = useTranslations();

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {t('instructor.quiz.new.title', {
            fallback: 'Create New Quiz (stub)',
          })}
        </h1>
        <Button asChild variant="outline">
          <Link href="/instructor/quizzes">
            {t('common.back', { fallback: 'Back to list' })}
          </Link>
        </Button>
      </div>
      <p className="text-muted-foreground">
        {t('instructor.quiz.new.description', {
          fallback:
            'This is a placeholder page. The full create form will be implemented soon.',
        })}
      </p>
    </div>
  );
}
