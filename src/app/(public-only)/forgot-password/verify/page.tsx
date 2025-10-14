import { Suspense } from 'react';

import { ForgotPasswordVerifyForm } from '@/components/features/auth/components/ForgotPasswordVerifyForm';
import { FullPageLoading } from '@/components/shared/ui/FullPageLoading';

export default function ForgotPasswordVerifyPage() {
  return (
    <Suspense fallback={<div className="py-16"><FullPageLoading /></div>}>
      <ForgotPasswordVerifyForm />
    </Suspense>
  );
}
