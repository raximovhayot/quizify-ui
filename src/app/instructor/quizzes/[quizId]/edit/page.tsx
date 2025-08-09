'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

export default function EditQuizPage() {
  const t = useTranslations();
  const params = useParams<{ quizId: string }>();
  const quizId = Number(params.quizId);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
        {t('instructor.quiz.edit.title', { fallback: 'Edit Quiz' })}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {t('instructor.quiz.edit.stub', {
          fallback:
            'This is a stub page for editing quiz #{id}. The full editor UI will be implemented next.',
          id: quizId,
        })}
      </p>
    </div>
  );
}
