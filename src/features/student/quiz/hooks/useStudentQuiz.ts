import { useStudentAssignment } from '@/lib/api/hooks/assignments';

export function useStudentQuiz(id: number) {
  return useStudentAssignment(id);
}
