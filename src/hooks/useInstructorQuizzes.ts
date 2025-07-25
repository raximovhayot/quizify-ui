import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { quizService } from '@/lib/quiz-service';
import { 
  BasicQuizDataDTO, 
  QuizListParams, 
  QuizStatus,
  InstructorQuizCreateRequest,
  PageableResponse
} from '@/types/quiz';
import { toast } from 'sonner';

interface UseInstructorQuizzesState {
  quizzes: BasicQuizDataDTO[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
}

interface UseInstructorQuizzesReturn extends UseInstructorQuizzesState {
  // Data fetching
  fetchQuizzes: (params?: QuizListParams) => Promise<void>;
  refreshQuizzes: () => Promise<void>;
  
  // Quiz operations
  createQuiz: (quizData: InstructorQuizCreateRequest) => Promise<BasicQuizDataDTO | null>;
  updateQuizStatus: (quizId: number, status: QuizStatus) => Promise<void>;
  deleteQuiz: (quizId: number) => Promise<void>;
  duplicateQuiz: (quizId: number) => Promise<void>;
  
  // Search and filtering
  searchQuizzes: (searchTerm: string, status?: QuizStatus) => Promise<void>;
}

export function useInstructorQuizzes(): UseInstructorQuizzesReturn {
  const { data: session } = useSession();
  const [state, setState] = useState<UseInstructorQuizzesState>({
    quizzes: [],
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    isLoading: false,
    error: null
  });

  const [lastParams, setLastParams] = useState<QuizListParams>({});

  const getAccessToken = useCallback(() => {
    if (!session?.accessToken) {
      throw new Error('No access token available');
    }
    return session.accessToken;
  }, [session]);

  const fetchQuizzes = useCallback(async (params: QuizListParams = {}) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const accessToken = getAccessToken();
      const response: PageableResponse<BasicQuizDataDTO> = await quizService.getQuizzes(params, accessToken);
      
      setState(prev => ({
        ...prev,
        quizzes: response.content,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        currentPage: response.number,
        isLoading: false
      }));
      
      setLastParams(params);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch quizzes';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      toast.error(errorMessage);
    }
  }, [getAccessToken]);

  const refreshQuizzes = useCallback(async () => {
    await fetchQuizzes(lastParams);
  }, [fetchQuizzes, lastParams]);

  const createQuiz = useCallback(async (quizData: InstructorQuizCreateRequest): Promise<BasicQuizDataDTO | null> => {
    try {
      const accessToken = getAccessToken();
      const newQuiz = await quizService.createQuiz(quizData, accessToken);
      
      toast.success('Quiz created successfully');
      await refreshQuizzes();
      
      return newQuiz;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create quiz';
      toast.error(errorMessage);
      return null;
    }
  }, [getAccessToken, refreshQuizzes]);

  const updateQuizStatus = useCallback(async (quizId: number, status: QuizStatus) => {
    try {
      const accessToken = getAccessToken();
      await quizService.updateQuizStatus(quizId, status, accessToken);
      
      const statusText = status === QuizStatus.PUBLISHED ? 'published' : 'unpublished';
      toast.success(`Quiz ${statusText} successfully`);
      await refreshQuizzes();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update quiz status';
      toast.error(errorMessage);
    }
  }, [getAccessToken, refreshQuizzes]);

  const deleteQuiz = useCallback(async (quizId: number) => {
    try {
      const accessToken = getAccessToken();
      await quizService.deleteQuiz(quizId, accessToken);
      
      toast.success('Quiz deleted successfully');
      await refreshQuizzes();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete quiz';
      toast.error(errorMessage);
    }
  }, [getAccessToken, refreshQuizzes]);

  const duplicateQuiz = useCallback(async (quizId: number) => {
    try {
      const accessToken = getAccessToken();
      await quizService.duplicateQuiz(quizId, accessToken);
      
      toast.success('Quiz duplicated successfully');
      await refreshQuizzes();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to duplicate quiz';
      toast.error(errorMessage);
    }
  }, [getAccessToken, refreshQuizzes]);

  const searchQuizzes = useCallback(async (searchTerm: string, status?: QuizStatus) => {
    const params: QuizListParams = {
      search: searchTerm,
      status,
      page: 0,
      size: 20
    };
    await fetchQuizzes(params);
  }, [fetchQuizzes]);

  // Initial load
  useEffect(() => {
    if (session?.accessToken) {
      fetchQuizzes();
    }
  }, [session?.accessToken, fetchQuizzes]);

  return {
    ...state,
    fetchQuizzes,
    refreshQuizzes,
    createQuiz,
    updateQuizStatus,
    deleteQuiz,
    duplicateQuiz,
    searchQuizzes
  };
}