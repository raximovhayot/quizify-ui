'use client';

import { useTranslations } from 'next-intl';

export default function NewQuizPage() {
  const t = useTranslations();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
        {t('instructor.quiz.create.title', { fallback: 'Create Quiz' })}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t('instructor.quiz.create.stub', {
          fallback:
            'This is a stub page for creating a new quiz. The full editor UI will be implemented next.',
        })}
      </p>
    </div>
  );
}
