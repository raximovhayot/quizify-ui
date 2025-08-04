import { Suspense } from 'react';

import { ForgotPasswordForm } from '@/components/features/auth/components/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <ForgotPasswordForm />
    </Suspense>
  );
}
