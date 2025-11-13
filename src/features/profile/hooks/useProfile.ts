import { useProfile as useProfileBase } from '@/lib/api/hooks/profile';
import { profileKeys } from '@/features/profile/keys';

export function useProfile() {
  return useProfileBase();
}
