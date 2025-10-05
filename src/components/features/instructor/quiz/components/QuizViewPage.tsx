'use client';

import { FileText } from 'lucide-react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { ROUTES_APP } from '@/components/features/instructor/routes';
import { ContentPlaceholder } from '@/components/shared/ui/ContentPlaceholder';

import { useQuiz } from '../hooks/useQuiz';
import { QuizViewActions } from './QuizViewActions';
import { QuizViewConfiguration } from './QuizViewConfiguration';
import { QuizViewHeader } from './QuizViewHeader';
import { QuizViewQuestions } from './QuizViewQuestions';
import { QuizViewSkeleton } from './QuizViewSkeleton';

export interface QuizViewPageProps {
  quizId: number;
}

export function QuizViewPage({ quizId }: Readonly<QuizViewPageProps>) {
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
      <div className="container mx-auto ">
        <div className="space-y-6 sm:space-y-8">
          {/* Header with back button and status */}
          <QuizViewHeader quiz={quiz} />

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Sidebar (Settings + Actions) - first on mobile, right column on desktop */}
            <div className="order-1 lg:order-2 lg:col-span-1 space-y-6">
              <QuizViewConfiguration quiz={quiz} />
              <QuizViewActions quiz={quiz} />
            </div>

            {/* Questions - main content on desktop, last on mobile */}
            <div className="order-2 lg:order-1 lg:col-span-2 space-y-6">
              <QuizViewQuestions quiz={quiz} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
