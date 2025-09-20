'use client';

import { useQuery } from '@tanstack/react-query';
import { CalendarClock, PlayCircle } from 'lucide-react';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { QuizDataDTO } from '@/components/features/instructor/quiz/types/quiz';
import { JoinQuizCard } from '@/components/features/student/home/components/JoinQuizCard';
import { QuizListCard } from '@/components/features/student/home/components/QuizListCard';
import { StudentQuizService } from '@/components/features/student/quiz/services/studentQuizService';

export function StudentHomeContainer() {
  const t = useTranslations();
  const { data: session } = useSession();

  const upcomingQuery = useQuery({
    queryKey: ['student', 'quizzes', 'upcoming'],
    queryFn: async ({ signal }): Promise<QuizDataDTO[]> => {
      if (!session?.accessToken) {
        return [];
      }
      try {
        return await StudentQuizService.getUpcomingQuizzes(signal);
      } catch (error) {
        console.error('Failed to fetch upcoming quizzes:', error);
        return [];
      }
    },
    enabled: !!session?.accessToken,
    staleTime: 60_000,
  });

  const inProgressQuery = useQuery({
    queryKey: ['student', 'quizzes', 'in-progress'],
    queryFn: async ({ signal }): Promise<QuizDataDTO[]> => {
      if (!session?.accessToken) {
        return [];
      }
      try {
        return await StudentQuizService.getInProgressQuizzes(signal);
      } catch (error) {
        console.error('Failed to fetch in-progress quizzes:', error);
        return [];
      }
    },
    enabled: !!session?.accessToken,
    staleTime: 30_000,
  });

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
