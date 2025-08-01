import { Suspense } from 'react';

import { PageResetPassword } from '@/components/features/auth/components/PageResetPassword';

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <PageResetPassword />
    </Suspense>
  );
}