import { useMyAttempts } from '@/lib/api/hooks/attempts';

export function useAttemptHistory() {
  return useMyAttempts();
}
