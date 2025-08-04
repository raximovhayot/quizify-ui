import { Suspense } from 'react';

import { SignInForm } from '@/components/features/auth/components/SignInForm';

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
