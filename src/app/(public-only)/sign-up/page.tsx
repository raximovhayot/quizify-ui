import { Suspense } from 'react';

import { SignUpForm } from '@/components/features/auth/components/SignUpForm';
import { FullPageLoading } from '@/components/shared/ui/FullPageLoading';

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="py-16"><FullPageLoading /></div>}>
      <SignUpForm />
    </Suspense>
  );
}
