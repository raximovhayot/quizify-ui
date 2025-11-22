'use client';

import { Suspense } from 'react';

import { useParams } from 'next/navigation';

import { useNextAuth } from '@/features/auth/hooks/useNextAuth';
import { UserRole } from '@/features/profile/types/account';
import { QuizViewPage } from '@/features/instructor/quiz/components/QuizViewPage';
import { QuizViewClient } from '@/features/student/quiz/components/QuizViewClient';
import { Spinner } from '@/components/ui/spinner';

export default function QuizDetailsPage() {
  const params = useParams<{ quizId: string }>();
  const quizId = Number(params?.quizId ?? Number.NaN);
  const { user, isLoading } = useNextAuth();

  if (Number.isNaN(quizId)) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-destructive">Invalid Quiz ID</h1>
        <p className="text-muted-foreground">
          The quiz ID provided is not valid.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Spinner className="size-6" />
      </div>
    );
  }

  // Check if user has instructor role
  const hasInstructorRole = user?.roles?.some(
    (role) => role.name === UserRole.INSTRUCTOR
  );

  // Show instructor view if user has instructor role, otherwise show student view
  if (hasInstructorRole) {
    return <QuizViewPage quizId={quizId} />;
  }

  // Student view
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[40vh]">
          <Spinner className="size-6" />
        </div>
      }
    >
      <QuizViewClient quizId={quizId} />
    </Suspense>
  );
}
