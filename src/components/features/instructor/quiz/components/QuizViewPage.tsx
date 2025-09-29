'use client';

import { CheckCircle2, Edit, FileText, Play } from 'lucide-react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { ROUTES_APP } from '@/components/features/instructor/routes';
import { ContentPlaceholder } from '@/components/shared/ui/ContentPlaceholder';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { useQuiz } from '../hooks/useQuiz';
import { QuizStatus } from '../types/quiz';
import { QuizViewConfiguration } from './QuizViewConfiguration';
import { QuizViewDetails } from './QuizViewDetails';
import { QuizViewHeader } from './QuizViewHeader';
import { QuizViewQuestions } from './QuizViewQuestions';

export interface QuizViewPageProps {
  quizId: number;
}

export function QuizViewPage({ quizId }: QuizViewPageProps) {
  const t = useTranslations();
  const router = useRouter();
  const { data: quiz, isLoading, error } = useQuiz(quizId);

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

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full space-y-8">
        {/* Hero Section with Quiz Overview */}
        <div className="space-y-6">
          <QuizViewHeader quiz={quiz} />
          {/* Mobile arrangement: details, then actions, then configuration */}
          <div className="sm:hidden space-y-3">
            <QuizViewDetails quiz={quiz} />
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => router.push(ROUTES_APP.quizzes.edit(quiz.id))}
                className="w-full flex items-center gap-2 h-9 px-3 text-sm"
              >
                <Edit className="h-4 w-4" />
                {t('instructor.quiz.action.edit', {
                  fallback: 'Edit Quiz',
                })}
              </Button>
              {quiz.status === QuizStatus.DRAFT ? (
                <Button
                  onClick={() => {
                    // TODO: Implement publish functionality
                    console.log('Publishing quiz:', quiz.id);
                  }}
                  variant="default"
                  className="w-full flex items-center gap-2 h-9 px-3 text-sm"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {t('instructor.quiz.action.publish', {
                    fallback: 'Publish',
                  })}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    // TODO: Implement start quiz functionality
                    console.log('Starting quiz:', quiz.id);
                  }}
                  variant="default"
                  className="w-full flex items-center gap-2 h-9 px-3 text-sm"
                >
                  <Play className="h-4 w-4" />
                  {t('instructor.quiz.action.start', {
                    fallback: 'Start',
                  })}
                </Button>
              )}
            </div>
            <QuizViewConfiguration quiz={quiz} />
          </div>
          {/* Desktop arrangement */}
          <div className="hidden sm:block space-y-6">
            <QuizViewDetails quiz={quiz} />
            <QuizViewConfiguration quiz={quiz} />
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full">
          <div className="space-y-6">
            <QuizViewQuestions quiz={quiz} />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuizViewSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="w-full space-y-8">
        {/* Hero Section Skeleton */}
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="space-y-4 mb-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-80" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-28" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          </div>

          {/* Details Skeleton */}
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

        {/* Main Content Skeleton */}
        <div className="w-full">
          <div className="space-y-6">
            {/* Questions Section Skeleton */}
            <div className="border rounded-lg">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-10" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="text-center py-12">
                  <Skeleton className="mx-auto h-24 w-24 rounded-full mb-4" />
                  <Skeleton className="h-6 w-48 mx-auto mb-2" />
                  <Skeleton className="h-4 w-80 mx-auto mb-6" />
                  <div className="flex justify-center gap-3">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-28" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
