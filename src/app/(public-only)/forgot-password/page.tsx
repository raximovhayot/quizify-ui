import { Suspense } from 'react';

import { PageForgotPassword } from '@/components/features/auth/components/PageForgotPassword';

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <PageForgotPassword />
    </Suspense>
  );
}