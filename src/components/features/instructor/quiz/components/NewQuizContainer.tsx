'use client';

import { useCallback } from 'react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { useCreateQuiz } from '../hooks/useQuizzes';
import { InstructorQuizCreateRequest } from '../types/quiz';
import { QuizForm } from './QuizForm';

export interface NewQuizContainerProps {
  className?: string;
}

export function NewQuizContainer({ className }: NewQuizContainerProps) {
  const t = useTranslations();
  const router = useRouter();
  const createQuizMutation = useCreateQuiz();

  const handleSubmit = useCallback(
    async (data: InstructorQuizCreateRequest) => {
      const created = await createQuizMutation.mutateAsync(data);
      // Navigate to the newly created quiz details page
      router.push(`/instructor/quizzes/${created.id}`);
    },
    [createQuizMutation, router]
  );

  const handleCancel = useCallback(() => {
    router.push('/instructor/quizzes');
  }, [router]);

  // If there was an error rendered outside toast, show a recoverable error UI
  // Generally, useCreateQuiz shows a toast on error; we keep UI simple here.

  return (
    <div className={className}>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
        {t('instructor.quiz.create.title')}
      </h1>
      <QuizForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createQuizMutation.isPending}
      />
    </div>
  );
}
