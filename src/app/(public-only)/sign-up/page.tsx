import { Suspense } from 'react';

import { PageRegister } from '@/components/features/auth/components/PageRegister';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageRegister />
    </Suspense>
  );
}