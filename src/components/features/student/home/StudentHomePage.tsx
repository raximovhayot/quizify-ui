'use client';

import {CalendarClock, PlayCircle} from 'lucide-react';

import {useTranslations} from 'next-intl';

import {JoinQuizCard} from '@/components/features/student/home/components/JoinQuizCard';
import {AttemptListCard} from '@/components/features/student/home/components/AttemptListCard';
import {RegistrationListCard} from '@/components/features/student/home/components/RegistrationListCard';
import {
    useStudentInProgressQuizzes,
    useStudentUpcomingQuizzes,
} from '@/components/features/student/home/hooks/useStudentQuizzes';

export function StudentHomePage() {
    const t = useTranslations();

    const upcomingQuery = useStudentUpcomingQuizzes();
    const inProgressQuery = useStudentInProgressQuizzes();

    const hasError = upcomingQuery.isError || inProgressQuery.isError;


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <JoinQuizCard/>

            <RegistrationListCard
                title={t('student.home.upcoming', {fallback: 'Upcoming quizzes'})}
                icon={<CalendarClock className="h-4 w-4 text-muted-foreground"/>}
                isLoading={upcomingQuery.isLoading}
                hasError={hasError}
                errorText={t('student.home.loadError', {
                    fallback: 'Failed to load upcoming quizzes',
                })}
                items={upcomingQuery.data?.content}
                emptyLabel={t('student.home.noUpcoming', {
                    fallback: 'No upcoming quizzes',
                })}
            />

            <AttemptListCard
                title={t('student.home.inProgress', {
                    fallback: 'In-progress assignments',
                })}
                icon={<PlayCircle className="h-4 w-4 text-muted-foreground"/>}
                isLoading={inProgressQuery.isLoading}
                hasError={hasError}
                errorText={t('student.home.loadErrorInProgress', {
                    fallback: 'Failed to load in-progress attempts',
                })}
                items={inProgressQuery.data?.content}
                emptyLabel={t('student.home.noInProgress', {
                    fallback: 'No in-progress attempts',
                })}
            />
        </div>
    );
}
