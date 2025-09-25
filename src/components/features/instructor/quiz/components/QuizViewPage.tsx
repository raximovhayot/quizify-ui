'use client';

import { ArrowLeft, Edit, FileText, Plus } from 'lucide-react';

import { useState } from 'react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { ROUTES_APP } from '@/components/features/instructor/routes';
import { ContentPlaceholder } from '@/components/shared/ui/ContentPlaceholder';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';

import { useQuiz } from '../hooks/useQuiz';
import { QuizDetails } from './QuizDetails';
import { QuizHeader } from './QuizHeader';
import { QuizSettings } from './QuizSettings';

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Back and Edit Buttons */}
      <div className="bg-card/50">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(ROUTES_APP.quizzes.list())}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('instructor.quiz.view.backToList', {
              fallback: 'Back to Quizzes',
            })}
          </Button>
          <Button
            onClick={() => router.push(ROUTES_APP.quizzes.edit(quiz.id))}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            {t('instructor.quiz.action.edit', { fallback: 'Edit' })}
          </Button>
        </div>
      </div>

      {/* Quiz View Section - Full Screen Layout */}
      <div className="bg-card/30 my-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Status, ID, Title, Description */}
          <div className="lg:col-span-2 space-y-4">
            {/* Top Left - Status and ID */}
            <QuizHeader quiz={quiz} />

            {/* Below - Title and Description */}
            <QuizDetails quiz={quiz} />
          </div>

          {/* Right Side - 4 Rows of Settings Values */}
          <div className="space-y-4">
            <QuizSettings quiz={quiz} />
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div className="flex-1">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {t('instructor.quiz.view.questions.title', {
                fallback: 'Questions',
              })}
            </h2>
            <div className="flex items-center gap-3">
              <Switch
                id="toggle-show-answers"
                checked={showAnswers}
                onCheckedChange={setShowAnswers}
              />
              <Label htmlFor="toggle-show-answers" className="cursor-pointer">
                {t('instructor.quiz.view.questions.showAnswers', {
                  fallback: 'Show Answers',
                })}
              </Label>
            </div>
          </div>

          {/* Questions Content */}
          {quiz.numberOfQuestions === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-border rounded-lg bg-muted/20">
              <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {t('instructor.quiz.view.questions.empty.title', {
                  fallback: 'No questions yet',
                })}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {t('instructor.quiz.view.questions.empty.description', {
                  fallback:
                    'Start building your quiz by adding your first question.',
                })}
              </p>
              <Button
                onClick={() => router.push(ROUTES_APP.quizzes.edit(quiz.id))}
                size="lg"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {t('instructor.quiz.view.questions.createFirst', {
                  fallback: 'Create Question',
                })}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center py-12 border border-border rounded-lg bg-card/50">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {t('instructor.quiz.view.questions.placeholder.title', {
                    fallback: 'Questions will be displayed here',
                  })}
                </h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  {t('instructor.quiz.view.questions.placeholder.description', {
                    fallback:
                      'The detailed question editor and viewer will be implemented in the next phase.',
                  })}
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
                    {t('instructor.quiz.view.questions.editQuestions', {
                      fallback: 'Edit Questions',
                    })}
                  </Button>
                  <Button
                    onClick={() =>
                      router.push(ROUTES_APP.quizzes.edit(quiz.id))
                    }
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {t('instructor.quiz.view.questions.addQuestion', {
                      fallback: 'Add Question',
                    })}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuizViewSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b bg-card/50 px-6 py-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* Compact Top Section Skeleton */}
      <div className="border-b bg-card/30 px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quiz Info Skeleton */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-7 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-8 w-80" />
                <Skeleton className="h-5 w-96" />
              </div>
              <Skeleton className="h-10 w-20" />
            </div>
          </div>

          {/* Quick Stats & Settings Skeleton */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="text-center p-3 rounded-lg border bg-card"
                >
                  <Skeleton className="h-6 w-8 mx-auto mb-1" />
                  <Skeleton className="h-3 w-12 mx-auto" />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Questions Section Skeleton */}
      <div className="flex-1 px-6 py-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-9 w-32" />
          </div>

          <div className="text-center py-16 border-2 border-dashed border-border rounded-lg bg-muted/20">
            <Skeleton className="mx-auto h-16 w-16 rounded mb-4" />
            <Skeleton className="h-6 w-64 mx-auto mb-2" />
            <Skeleton className="h-4 w-80 mx-auto mb-6" />
            <div className="flex justify-center gap-3">
              <Skeleton className="h-11 w-32" />
              <Skeleton className="h-11 w-36" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
