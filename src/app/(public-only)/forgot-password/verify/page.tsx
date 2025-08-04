import { Suspense } from 'react';

import { ForgotPasswordVerifyForm } from '@/components/features/auth/components/ForgotPasswordVerifyForm';

export default function ForgotPasswordVerifyPage() {
  return (
    <Suspense>
      <ForgotPasswordVerifyForm />
    </Suspense>
  );
}
