import { Suspense } from 'react';

import { SignUpVerifyForm } from '@/components/features/auth/components/SignUpVerifyForm';

export default function SignUpVerifyPage() {
  return (
    <Suspense>
      <SignUpVerifyForm />
    </Suspense>
  );
}
