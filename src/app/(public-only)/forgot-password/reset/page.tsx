import { Suspense } from 'react';

import { ResetPasswordForm } from '@/components/features/auth/components/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
