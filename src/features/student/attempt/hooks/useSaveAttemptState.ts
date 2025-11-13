import { useSaveAttemptProgress } from '@/lib/api/hooks/attempts';

export function useSaveAttemptState() {
  return useSaveAttemptProgress();
}
