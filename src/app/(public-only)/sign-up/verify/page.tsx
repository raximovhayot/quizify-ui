import { Suspense } from 'react';

import { PageRegisterVerify } from '@/components/features/auth/components/PageRegisterVerify';

export default function RegisterVerifyPage() {
  return (
    <Suspense>
      <PageRegisterVerify />
    </Suspense>
  );
}