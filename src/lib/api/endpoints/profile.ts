import { apiClient } from '../client';

export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'INSTRUCTOR' | 'STUDENT';
  email?: string;
  createdAt: string;
  defaultDashboard?: 'INSTRUCTOR' | 'STUDENT';
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  defaultDashboard?: 'INSTRUCTOR' | 'STUDENT';
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const profileApi = {
  getProfile: () =>
    apiClient.get<UserProfile>('/account/profile'),
  
  updateProfile: (data: UpdateProfileRequest) =>
    apiClient.put<UserProfile>('/account/profile', data),
  
  changePassword: (data: ChangePasswordRequest) =>
    apiClient.post('/account/change-password', data),
  
  completeProfile: (data: UpdateProfileRequest) =>
    apiClient.post<UserProfile>('/account/complete-profile', data),
};
