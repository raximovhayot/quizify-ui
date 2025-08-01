import { Suspense } from 'react';

import { PageSignUpVerify } from '@/components/features/auth/components/PageSignUpVerify';

export default function SignUpVerifyPage() {
  return (
    <Suspense>
      <PageSignUpVerify />
    </Suspense>
  );
}