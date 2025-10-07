import {useQuery} from '@tanstack/react-query';

import {studentHomeKeys} from '@/components/features/student/home/keys';
import {StudentAssignmentService} from '@/components/features/student/assignment/services/studentAssignmentService';
import {StudentAttemptService} from '@/components/features/student/history/services/studentAttemptService';
import {AttemptStatus} from '@/components/features/student/quiz/types/attempt';

export function useStudentUpcomingQuizzes() {
    return useQuery({
        queryKey: studentHomeKeys.upcoming(),
        queryFn: async ({signal}) => {
            return StudentAssignmentService.getRegistrations({page: 0, size: 10}, signal);
        },
        staleTime: 60_000,
    });
}

export function useStudentInProgressQuizzes() {
    return useQuery({
        queryKey: studentHomeKeys.inProgress(),
        queryFn: async ({signal}) => {
            return StudentAttemptService.getAttempts(signal, {
                status: AttemptStatus.STARTED,
                page: 0,
                size: 10
            });
        },
        staleTime: 30_000,
    });
}
