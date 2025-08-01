import { Suspense } from 'react';

import { PageSignUp } from '@/components/features/auth/components/PageSignUp';

export default function SignUpPage() {
  return (
    <Suspense>
      <PageSignUp />
    </Suspense>
  );
}