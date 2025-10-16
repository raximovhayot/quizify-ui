'use client';

import { ProfileUpdateDetailsForm } from '@/features/profile/components/ProfileUpdateDetailsForm';
import { ProfileUpdatePasswordForm } from '@/features/profile/components/ProfileUpdatePasswordForm';

export function ProfilePage() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <ProfileUpdateDetailsForm />
      <ProfileUpdatePasswordForm />
    </div>
  );
}

export default ProfilePage;
