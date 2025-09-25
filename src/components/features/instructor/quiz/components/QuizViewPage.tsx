'use client';

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Edit,
  Eye,
  FileText,
  Plus,
  RotateCcw,
  Shuffle,
  Sparkles,
} from 'lucide-react';

import { useState } from 'react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { ROUTES_APP } from '@/components/features/instructor/routes';
import { ContentPlaceholder } from '@/components/shared/ui/ContentPlaceholder';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';

import { useQuiz } from '../hooks/useQuiz';
import { QuizStatus } from '../types/quiz';

export interface QuizViewPageProps {
  quizId: number;
}

export function QuizViewPage({ quizId }: QuizViewPageProps) {
  const t = useTranslations();
  const router = useRouter();
  const { data: quiz, isLoading, error } = useQuiz(quizId);
  const [showAnswers, setShowAnswers] = useState(false);

  if (isLoading) {
    return <QuizViewSkeleton />;
  }

  if (error || !quiz) {
    return (
      <ContentPlaceholder
        icon={FileText}
        title={t('instructor.quiz.view.error.title', {
          fallback: 'Quiz not found',
        })}
        description={t('instructor.quiz.view.error.description', {
          fallback:
            'The quiz you are looking for does not exist or has been deleted.',
        })}
        actions={[
          {
            label: t('instructor.quiz.view.backToList', {
              fallback: 'Back to Quizzes',
            }),
            onClick: () => router.push(ROUTES_APP.quizzes.list()),
            variant: 'default',
          },
        ]}
      />
    );
  }

  const getStatusColor = (status: QuizStatus) => {
    switch (status) {
      case QuizStatus.PUBLISHED:
        return 'default';
      case QuizStatus.DRAFT:
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: QuizStatus) => {
    switch (status) {
      case QuizStatus.PUBLISHED:
        return CheckCircle2;
      case QuizStatus.DRAFT:
        return AlertCircle;
      default:
        return AlertCircle;
    }
  };

  const formatTimeLimit = (minutes: number) => {
    if (minutes === 0)
      return t('instructor.quiz.time.unlimited', { fallback: 'Unlimited' });
    if (minutes < 60)
      return t('instructor.quiz.time.minutes', {
        fallback: '{minutes}m',
        minutes,
      });
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0)
      return t('instructor.quiz.time.hours', { fallback: '{hours}h', hours });
    return t('instructor.quiz.time.hoursMinutes', {
      fallback: '{hours}h {minutes}m',
      hours,
      minutes: remainingMinutes,
    });
  };

  const formatAttempts = (attempts: number) => {
    if (attempts === 0)
      return t('instructor.quiz.attempts.unlimited', { fallback: 'Unlimited' });
    return t('instructor.quiz.attempts.count', {
      fallback: '{count}',
      count: attempts,
    });
  };

  const StatusIcon = getStatusIcon(quiz.status);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto space-y-8">
        {/* Hero Section with Quiz Overview */}
        <div className="space-y-6">
          {/* Quiz Info with Configuration Items */}
          <div className="space-y-6">
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(ROUTES_APP.quizzes.list())}
                  className="p-1 h-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Badge
                  variant={getStatusColor(quiz.status)}
                  className="flex items-center gap-1"
                >
                  <StatusIcon className="h-3 w-3" />
                  {quiz.status === QuizStatus.PUBLISHED ? 'Published' : 'Draft'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  ID: {quiz.id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">
                  {quiz.title ||
                    t('instructor.quiz.untitled', {
                      fallback: 'Untitled Quiz',
                    })}
                </h1>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() =>
                      router.push(ROUTES_APP.quizzes.edit(quiz.id))
                    }
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    {t('instructor.quiz.action.edit', {
                      fallback: 'Edit Quiz',
                    })}
                  </Button>
                  {quiz.status === QuizStatus.PUBLISHED && (
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Live
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {quiz.description && (
              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                {quiz.description}
              </p>
            )}

            {/* Configuration Items */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Time Limit:</span>
                <Badge variant="outline" className="text-xs">
                  {formatTimeLimit(quiz.settings.time)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
                <RotateCcw className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Max Attempts:</span>
                <Badge variant="outline" className="text-xs">
                  {formatAttempts(quiz.settings.attempt)}
                </Badge>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
                <Shuffle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Shuffle Questions:</span>
                <Badge
                  variant={
                    quiz.settings.shuffleQuestions ? 'default' : 'secondary'
                  }
                  className="text-xs"
                >
                  {quiz.settings.shuffleQuestions ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
                <Shuffle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Shuffle Answers:</span>
                <Badge
                  variant={
                    quiz.settings.shuffleAnswers ? 'default' : 'secondary'
                  }
                  className="text-xs"
                >
                  {quiz.settings.shuffleAnswers ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {/* Questions Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Questions ({quiz.numberOfQuestions})
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <Switch
                      id="toggle-show-answers"
                      checked={showAnswers}
                      onCheckedChange={setShowAnswers}
                    />
                    <Label
                      htmlFor="toggle-show-answers"
                      className="cursor-pointer text-sm"
                    >
                      Show Answers
                    </Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {quiz.numberOfQuestions === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Plus className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Ready to add questions?
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Start building your quiz by creating engaging questions
                      that will challenge and educate your students.
                    </p>
                    <Button
                      onClick={() =>
                        router.push(ROUTES_APP.quizzes.edit(quiz.id))
                      }
                      size="lg"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Question
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Eye className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      Questions Preview
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Your quiz contains {quiz.numberOfQuestions} question
                      {quiz.numberOfQuestions !== 1 ? 's' : ''}. Use the edit
                      mode to view and modify individual questions.
                    </p>
                    <div className="flex justify-center gap-3">
                      <Button
                        onClick={() =>
                          router.push(ROUTES_APP.quizzes.edit(quiz.id))
                        }
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit Questions
                      </Button>
                      <Button
                        onClick={() =>
                          router.push(ROUTES_APP.quizzes.edit(quiz.id))
                        }
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Question
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuizViewSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Hero Section Skeleton */}
        <div className="space-y-6">
          {/* Quiz Info with Configuration Items Skeleton */}
          <div className="space-y-6">
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-80" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-28" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            </div>

            <Skeleton className="h-5 w-96" />

            {/* Configuration Items Skeleton */}
            <div className="flex flex-wrap gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50"
                >
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {/* Questions Section Skeleton */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-10" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Skeleton className="mx-auto h-24 w-24 rounded-full mb-4" />
                  <Skeleton className="h-6 w-48 mx-auto mb-2" />
                  <Skeleton className="h-4 w-80 mx-auto mb-6" />
                  <div className="flex justify-center gap-3">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-28" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
