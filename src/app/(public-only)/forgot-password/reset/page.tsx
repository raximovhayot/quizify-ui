import { Suspense } from 'react';

import { ResetPasswordForm } from '@/components/features/auth/components/ResetPasswordForm';
import { FullPageLoading } from '@/components/shared/ui/FullPageLoading';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="py-16"><FullPageLoading /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
