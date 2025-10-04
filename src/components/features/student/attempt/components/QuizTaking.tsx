'use client';

import { useState } from 'react';

import { AlertCircle } from 'lucide-react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import {
  useAttempt,
  useSubmitAnswer,
  useSubmitAttempt,
} from '../hooks/useAttempt';
import { QuestionDisplay } from './QuestionDisplay';
import { QuestionNavigation } from './QuestionNavigation';
import { QuizProgress } from './QuizProgress';
import { Timer } from './Timer';

interface QuizTakingProps {
  assignmentId: number;
  attemptId: number;
}

export function QuizTaking({ assignmentId, attemptId }: QuizTakingProps) {
  const t = useTranslations();
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [pendingAnswer, setPendingAnswer] = useState<unknown>(null);

  const { data, isLoading, error } = useAttempt(assignmentId, attemptId);
  const submitAnswer = useSubmitAnswer(assignmentId, attemptId);
  const submitAttempt = useSubmitAttempt(assignmentId, attemptId);

  if (isLoading) {
    return <QuizTakingSkeleton />;
  }

  if (error || !data) {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            {t('student.attempt.error', { fallback: 'Error Loading Quiz' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t('student.attempt.errorMessage', {
              fallback: 'Unable to load the quiz. Please try again later.',
            })}
          </p>
          <Button onClick={() => router.back()} className="mt-4">
            {t('common.goBack', { fallback: 'Go Back' })}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { attempt, questions } = data;
  const currentQuestion = questions[currentQuestionIndex];

  const handleSaveAnswer = async () => {
    if (!currentQuestion || pendingAnswer === null) return;

    await submitAnswer.mutateAsync({
      questionId: currentQuestion.id,
      answer: pendingAnswer,
    });
    setPendingAnswer(null);
  };

  const handleSubmitAttempt = async () => {
    const result = await submitAttempt.mutateAsync();
    setShowSubmitDialog(false);
    // Navigate to results page
    router.push(
      `/student/assignments/${assignmentId}/attempts/${attemptId}/results`
    );
  };

  const handleTimeUp = () => {
    // Auto-submit when time is up
    submitAttempt.mutate();
  };

  const handleFlag = () => {
    // TODO: Implement flag question functionality
    // This would require a backend endpoint to store flagged questions
  };

  return (
    <div className="container max-w-5xl mx-auto py-8 space-y-6">
      {/* Header with timer and progress */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {t('student.attempt.takingQuiz', { fallback: 'Taking Quiz' })}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('student.attempt.attemptNumber', {
              fallback: 'Attempt #{{number}}',
              number: attempt.id,
            })}
          </p>
        </div>
        {attempt.timeRemaining && attempt.timeRemaining > 0 && (
          <Timer timeRemaining={attempt.timeRemaining} onTimeUp={handleTimeUp} />
        )}
      </div>

      {/* Progress indicator */}
      <QuizProgress
        totalQuestions={attempt.totalQuestions}
        answeredQuestions={attempt.answeredQuestions}
      />

      {/* Question display */}
      <QuestionDisplay
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        onAnswerChange={setPendingAnswer}
        onSaveAnswer={handleSaveAnswer}
        onFlag={handleFlag}
        isSaving={submitAnswer.isPending}
      />

      {/* Navigation */}
      <QuestionNavigation
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        onNavigate={setCurrentQuestionIndex}
        onPrevious={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
        onNext={() =>
          setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))
        }
        canGoPrevious={currentQuestionIndex > 0}
        canGoNext={currentQuestionIndex < questions.length - 1}
      />

      {/* Submit button */}
      <div className="flex justify-center pt-4">
        <Button
          size="lg"
          onClick={() => setShowSubmitDialog(true)}
          className="min-w-48"
        >
          {t('student.attempt.submitQuiz', { fallback: 'Submit Quiz' })}
        </Button>
      </div>

      {/* Submit confirmation dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('student.attempt.confirmSubmit', {
                fallback: 'Submit Quiz?',
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('student.attempt.confirmSubmitMessage', {
                fallback:
                  'You have answered {{answered}} out of {{total}} questions. Are you sure you want to submit? You cannot change your answers after submission.',
                answered: attempt.answeredQuestions,
                total: attempt.totalQuestions,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('common.cancel', { fallback: 'Cancel' })}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitAttempt}
              disabled={submitAttempt.isPending}
            >
              {submitAttempt.isPending
                ? t('common.submitting', { fallback: 'Submitting...' })
                : t('student.attempt.confirmSubmitButton', {
                    fallback: 'Yes, Submit',
                  })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function QuizTakingSkeleton() {
  return (
    <div className="container max-w-5xl mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-96 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
