/**
 * React Query hooks for user profile operations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { profileApi, type UpdateProfileRequest, type ChangePasswordRequest } from '@/lib/api/endpoints/profile';
import { queryKeys } from '@/lib/query/keys';

/**
 * Get current user profile
 */
export const useProfile = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.profile.current(),
    queryFn: async () => {
      const response = await profileApi.getProfile();
      return response.data;
    },
    enabled,
  });
};

/**
 * Update user profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      const response = await profileApi.updateProfile(data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.profile.current(), data);
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });
};

/**
 * Change password
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: ChangePasswordRequest) => {
      await profileApi.changePassword(data);
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    },
  });
};

/**
 * Complete profile (for new users)
 */
export const useCompleteProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      const response = await profileApi.completeProfile(data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.profile.current(), data);
      toast.success('Profile completed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to complete profile');
    },
  });
};
