'use client';

import { format } from 'date-fns';
import { ArrowLeft, CheckCircle2, Clock, XCircle } from 'lucide-react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { useAttemptDetail } from '../hooks';

interface AttemptDetailPageProps {
  assignmentId: number;
  attemptId: number;
}

export function AttemptDetailPage({
  assignmentId,
  attemptId,
}: Readonly<AttemptDetailPageProps>) {
  const t = useTranslations();
  const router = useRouter();
  const { data: attempt, isLoading, error } = useAttemptDetail(assignmentId, attemptId);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'PPp');
    } catch {
      return dateString;
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return '-';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes === 0) return `${remainingSeconds}s`;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getStatusBadge = (status: string) => {
    const upperStatus = status.toUpperCase();
    switch (upperStatus) {
      case 'GRADED':
        return (
          <Badge variant="default" className="bg-green-600">
            {t('instructor.assignment.attempt.status.graded', {
              fallback: 'Graded',
            })}
          </Badge>
        );
      case 'SUBMITTED':
        return (
          <Badge variant="secondary">
            {t('instructor.assignment.attempt.status.submitted', {
              fallback: 'Submitted',
            })}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {t('instructor.assignment.attempt.status.inProgress', {
              fallback: 'In Progress',
            })}
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="container mx-auto p-4">
        <Button
          variant="ghost"
          onClick={() => router.push(`/instructor/analytics/${assignmentId}`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('common.back', { fallback: 'Back' })}
        </Button>
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-destructive mb-2">
              {t('instructor.attempt.detail.error.title', {
                fallback: 'Attempt not found',
              })}
            </h2>
            <p className="text-muted-foreground">
              {t('instructor.attempt.detail.error.description', {
                fallback:
                  'The attempt you are looking for does not exist or has been deleted.',
              })}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push(`/instructor/analytics/${assignmentId}`)}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back', { fallback: 'Back' })}
          </Button>
          <h1 className="text-3xl font-bold">
            {t('instructor.attempt.detail.title', {
              fallback: 'Attempt Details',
            })}
          </h1>
        </div>
        {getStatusBadge(attempt.status)}
      </div>

      {/* Student and Attempt Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('instructor.attempt.detail.student', { fallback: 'Student' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attempt.studentName}</div>
            <p className="text-sm text-muted-foreground">
              {t('instructor.attempt.detail.attemptNumber', {
                fallback: 'Attempt #{number}',
                number: attempt.attemptNumber,
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('instructor.attempt.detail.score', { fallback: 'Score' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attempt.score !== null ? attempt.score.toFixed(1) : '-'}
            </div>
            <p className="text-sm text-muted-foreground">
              {attempt.score !== null
                ? `${attempt.score.toFixed(0)}%`
                : t('instructor.attempt.detail.notGraded', {
                    fallback: 'Not graded',
                  })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Clock className="inline h-4 w-4 mr-1" />
              {t('instructor.attempt.detail.duration', { fallback: 'Duration' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(attempt.durationSeconds)}
            </div>
            <p className="text-sm text-muted-foreground">
              {t('instructor.attempt.detail.timeSpent', {
                fallback: 'Time spent',
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('instructor.attempt.detail.submitted', { fallback: 'Submitted' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {formatDate(attempt.completedAt)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('instructor.attempt.detail.started', { fallback: 'Started' })}:{' '}
              {formatDate(attempt.startedAt)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Questions */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('instructor.attempt.detail.questions.title', {
              fallback: 'Question Results',
            })}{' '}
            ({attempt.questions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attempt.questions.map((question, index) => (
              <Card
                key={question.questionId}
                className="border-l-4"
                style={{
                  borderLeftColor:
                    question.correct === true
                      ? 'rgb(34, 197, 94)'
                      : question.correct === false
                        ? 'rgb(239, 68, 68)'
                        : 'rgb(156, 163, 175)',
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                          {t('instructor.attempt.detail.questions.question', {
                            fallback: 'Question {number}',
                            number: index + 1,
                          })}
                        </span>
                        <Badge variant="outline">{question.questionType}</Badge>
                        {question.correct === true && (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        )}
                        {question.correct === false && (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: question.content }}
                      />
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold">
                        {question.pointsAwarded !== null
                          ? question.pointsAwarded.toFixed(1)
                          : '-'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t('instructor.attempt.detail.questions.points', {
                          fallback: 'points',
                        })}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                {question.comment && (
                  <CardContent className="pt-0">
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm font-medium mb-1">
                        {t('instructor.attempt.detail.questions.graderComment', {
                          fallback: 'Grader Comment:',
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {question.comment}
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
