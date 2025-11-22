'use client';

import { useCallback } from 'react';

import { useRouter } from 'next/navigation';

import { ROUTES_APP } from '@/features/dashboard/routes';

import { useCreateQuiz } from '../hooks/useQuizzes';
import { InstructorQuizCreateRequest } from '../types/quiz';
import { QuizForm } from './QuizForm';

export interface CreateQuizContainerProps {
  className?: string;
  hideTitle?: boolean;
}

export function CreateQuizContainer({
  className,
  hideTitle = false,
}: Readonly<CreateQuizContainerProps>) {
  const router = useRouter();
  const createQuizMutation = useCreateQuiz();

  const handleSubmit = useCallback(
    async (data: InstructorQuizCreateRequest) => {
      const created = await createQuizMutation.mutateAsync(data);
      // Navigate to the newly created quiz details page
      router.push(ROUTES_APP.quizzes.detail(created.id));
    },
    [createQuizMutation, router]
  );

  const handleCancel = useCallback(() => {
    router.push(ROUTES_APP.quizzes.list());
  }, [router]);

  return (
    <QuizForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isSubmitting={createQuizMutation.isPending}
      className={className}
      hideTitle={hideTitle}
    />
  );
}
