'use client';

import { useCallback } from 'react';

import { useRouter } from 'next/navigation';

import { useCreateQuiz } from '../hooks/useQuizzes';
import { InstructorQuizCreateRequest } from '../types/quiz';
import { QuizForm } from './QuizForm';

export interface CreateQuizContainerProps {
  className?: string;
}

export function CreateQuizContainer({
  className,
}: Readonly<CreateQuizContainerProps>) {
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

  return (
    <QuizForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isSubmitting={createQuizMutation.isPending}
      className={className}
    />
  );
}
