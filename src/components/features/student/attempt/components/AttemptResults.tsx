'use client';

import { CheckCircle2, XCircle } from 'lucide-react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

import { useAttemptResults } from '../hooks/useAttempt';

interface AttemptResultsProps {
  assignmentId: number;
  attemptId: number;
}

export function AttemptResults({
  assignmentId,
  attemptId,
}: AttemptResultsProps) {
  const t = useTranslations();
  const router = useRouter();
  const { data, isLoading, error } = useAttemptResults(assignmentId, attemptId);

  if (isLoading) {
    return <AttemptResultsSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">
              {t('student.results.error', {
                fallback: 'Error Loading Results',
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('student.results.errorMessage', {
                fallback:
                  'Unable to load your results. Please try again later.',
              })}
            </p>
            <Button onClick={() => router.back()} className="mt-4">
              {t('common.goBack', { fallback: 'Go Back' })}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { result, questions } = data;
  const percentage = (result.score / (result.totalQuestions * 100)) * 100 || 0;

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      {/* Overall results */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            {percentage >= 70 ? (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-orange-600" />
            )}
            {t('student.results.title', { fallback: 'Quiz Results' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score */}
          <div className="text-center">
            <div className="text-5xl font-bold mb-2">
              {percentage.toFixed(1)}%
            </div>
            <p className="text-muted-foreground">
              {t('student.results.scoreLabel', {
                fallback: 'Your Score',
              })}
            </p>
          </div>

          {/* Progress bar */}
          <Progress value={percentage} className="h-3" />

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {result.correctAnswers}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {t('student.results.correct', {
                  fallback: 'Correct',
                })}
              </div>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {result.incorrectAnswers}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {t('student.results.incorrect', {
                  fallback: 'Incorrect',
                })}
              </div>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {result.unansweredQuestions}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {t('student.results.unanswered', {
                  fallback: 'Unanswered',
                })}
              </div>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">
                {Math.floor(result.timeSpent / 60)}:
                {String(result.timeSpent % 60).padStart(2, '0')}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {t('student.results.timeSpent', {
                  fallback: 'Time Spent',
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question-by-question results (if allowed) */}
      {result.canViewAnswers && questions && questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              {t('student.results.detailedResults', {
                fallback: 'Detailed Results',
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map((q, index) => (
              <div
                key={q.questionId}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium flex items-center gap-2">
                      {t('student.results.questionNumber', {
                        fallback: 'Question {{number}}',
                        number: index + 1,
                      })}
                      {q.isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </h3>
                    <div
                      className="text-sm text-muted-foreground mt-1"
                      dangerouslySetInnerHTML={{
                        __html: q.question.content,
                      }}
                    />
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">
                      {q.score} / {q.maxScore}
                    </span>
                  </div>
                </div>

                {q.feedback && (
                  <p className="text-sm bg-muted p-3 rounded-md">
                    {q.feedback}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={() => router.push('/student')}>
          {t('common.goHome', { fallback: 'Go Home' })}
        </Button>
        <Button onClick={() => router.push('/student/history')}>
          {t('student.results.viewHistory', {
            fallback: 'View History',
          })}
        </Button>
      </div>
    </div>
  );
}

function AttemptResultsSkeleton() {
  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <Skeleton className="h-16 w-32 mx-auto" />
            <Skeleton className="h-4 w-24 mx-auto mt-2" />
          </div>
          <Skeleton className="h-3 w-full" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
