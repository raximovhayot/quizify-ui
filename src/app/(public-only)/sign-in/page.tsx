import { Suspense } from 'react';

import { PageSignIn } from '@/components/features/auth/components/PageSignIn';

export default function SignInPage() {
  return (
    <Suspense>
      <PageSignIn />
    </Suspense>
  );
}