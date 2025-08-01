import { Suspense } from 'react';

import { PageForgotPasswordVerify } from '@/components/features/auth/components/PageForgotPasswordVerify';

export default function ForgotPasswordVerifyPage() {
  return (
    <Suspense>
      <PageForgotPasswordVerify />
    </Suspense>
  );
}