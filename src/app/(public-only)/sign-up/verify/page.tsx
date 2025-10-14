import { Suspense } from 'react';

import { SignUpVerifyForm } from '@/components/features/auth/components/SignUpVerifyForm';
import { FullPageLoading } from '@/components/shared/ui/FullPageLoading';

export default function SignUpVerifyPage() {
  return (
    <Suspense fallback={<div className="py-16"><FullPageLoading /></div>}>
      <SignUpVerifyForm />
    </Suspense>
  );
}
