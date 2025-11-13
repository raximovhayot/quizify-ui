import { useStudentAssignments } from '@/lib/api/hooks/assignments';
import { useMyAttempts } from '@/lib/api/hooks/attempts';

export function useStudentQuizzes() {
  const assignments = useStudentAssignments();
  const attempts = useMyAttempts();
  
  return {
    assignments,
    attempts,
  };
}
