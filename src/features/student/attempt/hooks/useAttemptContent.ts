import { useAttemptContent as useAttemptContentBase } from '@/lib/api/hooks/attempts';

export function useAttemptContent(attemptId: number) {
  return useAttemptContentBase(attemptId);
}
