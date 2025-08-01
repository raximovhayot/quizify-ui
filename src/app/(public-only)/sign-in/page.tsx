import { Suspense } from 'react';

import { PageLogin } from '@/components/features/auth/components/PageLogin';

export default function LoginPage() {
  return (
    <Suspense>
      <PageLogin />
    </Suspense>
  );
}