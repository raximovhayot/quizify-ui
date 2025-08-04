import { Suspense } from 'react';

import { SignUpForm } from '@/components/features/auth/components/SignUpForm';

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
