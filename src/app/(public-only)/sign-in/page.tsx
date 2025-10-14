import { Suspense } from 'react';

import { SignInForm } from '@/components/features/auth/components/SignInForm';
import { FullPageLoading } from '@/components/shared/ui/FullPageLoading';

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="py-16"><FullPageLoading /></div>}>
      <SignInForm />
    </Suspense>
  );
}
