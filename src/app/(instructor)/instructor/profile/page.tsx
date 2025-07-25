'use client';

import { useTranslations } from 'next-intl';
import { InstructorProfileSettings } from '@/components/profile/InstructorProfileSettings';

export default function InstructorProfilePage() {
  const t = useTranslations();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('profile.settings.title', { default: 'Profile Settings' })}
        </h1>
        <p className="mt-2 text-gray-600">
          {t('profile.settings.description', { 
            default: 'Manage your account settings and preferences' 
          })}
        </p>
      </div>

      {/* Profile Settings Component */}
      <InstructorProfileSettings />
    </div>
  );
}