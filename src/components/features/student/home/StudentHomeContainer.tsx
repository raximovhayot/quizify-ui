'use client';

import { CalendarClock, PlayCircle } from 'lucide-react';

import { useTranslations } from 'next-intl';

import { JoinQuizCard } from '@/components/features/student/home/components/JoinQuizCard';
import { QuizListCard } from '@/components/features/student/home/components/QuizListCard';
import {
  useStudentInProgressQuizzes,
  useStudentUpcomingQuizzes,
} from '@/components/features/student/home/hooks/useStudentQuizzes';

export function StudentHomeContainer() {
  const t = useTranslations();

  const upcomingQuery = useStudentUpcomingQuizzes();
  const inProgressQuery = useStudentInProgressQuizzes();

  const hasError = upcomingQuery.isError || inProgressQuery.isError;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <JoinQuizCard />

      <QuizListCard
        title={t('student.home.upcoming', { fallback: 'Upcoming quizzes' })}
        icon={<CalendarClock className="h-4 w-4 text-muted-foreground" />}
        isLoading={upcomingQuery.isLoading}
        hasError={hasError}
        errorText={t('student.home.loadError', {
          fallback: 'Failed to load upcoming quizzes',
        })}
        items={upcomingQuery.data || []}
        emptyLabel={t('student.home.noUpcoming', {
          fallback: 'No upcoming quizzes',
        })}
      />

      <QuizListCard
        title={t('student.home.inProgress', {
          fallback: 'In-progress quizzes',
        })}
        icon={<PlayCircle className="h-4 w-4 text-muted-foreground" />}
        isLoading={inProgressQuery.isLoading}
        hasError={hasError}
        errorText={t('student.home.loadErrorInProgress', {
          fallback: 'Failed to load in-progress quizzes',
        })}
        items={inProgressQuery.data || []}
        emptyLabel={t('student.home.noInProgress', {
          fallback: 'No in-progress quizzes',
        })}
      />
    </div>
  );
}
