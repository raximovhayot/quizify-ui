import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';

import { StudentHomePage } from '@/components/features/student/home/StudentHomePage';
import { FullPageLoading } from '@/components/shared/ui/FullPageLoading';

export default async function Page() {
  const t = await getTranslations('common');
  return (
    <Suspense fallback={<FullPageLoading text={t('loading', { default: 'Loading...' })} />}>
      <StudentHomePage />
    </Suspense>
  );
}
