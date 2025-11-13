import { useEffect, useRef, useCallback } from 'react';
import { useSaveAttemptProgress } from '@/lib/api/hooks/attempts';

interface Answer {
  questionId: number;
  answerIds: number[];
}

interface UseAutoSaveOptions {
  attemptId: number;
  enabled?: boolean;
  debounceMs?: number;
}

/**
 * Hook for auto-saving attempt progress
 * Features:
 * - Debounced save (2 seconds by default after last change)
 * - Returns save status and trigger function
 * - Handles offline scenarios gracefully
 */
export function useAutoSave({ 
  attemptId, 
  enabled = true, 
  debounceMs = 2000 
}: UseAutoSaveOptions) {
  const saveMutation = useSaveAttemptProgress();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveAnswers = useCallback((answers: Answer[]) => {
    if (!enabled || answers.length === 0) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce the save
    timeoutRef.current = setTimeout(() => {
      saveMutation.mutate({
        id: attemptId,
        data: { answers },
      });
    }, debounceMs);
  }, [attemptId, enabled, debounceMs, saveMutation]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    saveAnswers,
    isSaving: saveMutation.isPending,
    isError: saveMutation.isError,
    isSuccess: saveMutation.isSuccess,
  };
}
