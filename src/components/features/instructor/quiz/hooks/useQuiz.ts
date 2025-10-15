import {useQuery} from '@tanstack/react-query';


import {quizKeys} from '@/components/features/instructor/quiz/keys';

import {quizDataDTOSchema} from '../schemas/quizSchema';
import {QuizService} from '../services/quizService';
import {QuizDataDTO} from '../types/quiz';

// Hook for fetching single quiz
export function useQuiz(quizId: number) {
    return useQuery({
        queryKey: quizKeys.detail(quizId),
        queryFn: async ({signal}): Promise<QuizDataDTO> => {
            const response = await QuizService.getQuiz(quizId, signal);
            // Validate response with Zod schema
            return quizDataDTOSchema.parse(response);
        },
        enabled: !!quizId,
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 20 * 60 * 1000, // 20 minutes (quiz details are stable)
        // Use previous data while refetching
        placeholderData: (previousData) => previousData,
        // Prefetch related data
        select: (data) => {
            // You can transform data here if needed
            return data;
        },
    });
}
