import { useStartAttempt } from '@/lib/api/hooks/attempts';

export function useJoinQuiz() {
  return useStartAttempt();
}
