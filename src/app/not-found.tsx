import { Home } from 'lucide-react';

import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default async function NotFound() {
  const t = await getTranslations('notFound');

  return (
    <main className="flex min-h-[60svh] flex-col items-center justify-center px-4 py-16 text-center">
      <p className="mb-2 text-sm font-semibold text-muted-foreground">404</p>
      <h1 className="mb-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
        {t('title')}
      </h1>
      <p className="mx-auto mb-6 max-w-[48rem] text-pretty text-muted-foreground">
        {t('description')}
      </p>
      <div className="flex items-center gap-3">
        <Button asChild>
          <Link href="/">
            <Home />
            <span>{t('goHome')}</span>
          </Link>
        </Button>
      </div>
    </main>
  );
}
