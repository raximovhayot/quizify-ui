import { Suspense } from 'react';

import { ForgotPasswordForm } from '@/components/features/auth/components/ForgotPasswordForm';
import { FullPageLoading } from '@/components/shared/ui/FullPageLoading';

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="py-16"><FullPageLoading /></div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
