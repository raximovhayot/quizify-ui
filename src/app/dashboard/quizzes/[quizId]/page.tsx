'use client';

import { useParams } from 'next/navigation';

import { QuizViewPage } from '@/features/instructor/quiz/components/QuizViewPage';

export default function QuizDetailsPage() {
  const params = useParams<{ quizId: string }>();
  const quizId = Number(params?.quizId ?? Number.NaN);

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

  // All users see the quiz management interface
  return <QuizViewPage quizId={quizId} />;
}
