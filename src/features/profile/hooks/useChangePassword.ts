import { useChangePassword as useChangePasswordBase } from '@/lib/api/hooks/profile';

export function useChangePassword() {
  return useChangePasswordBase();
}
