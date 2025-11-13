import { useAttemptDetails } from '@/lib/api/hooks/attempts';

/**
 * useAttemptDetail — fetch detailed attempt information
 * Delegates to centralized hook
 */
export function useAttemptDetail(assignmentId: number, attemptId: number) {
  return useAttemptDetails(attemptId, !!assignmentId && !!attemptId);
}
