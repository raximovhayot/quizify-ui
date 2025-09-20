import { ReactNode } from 'react';

import { Header } from '@/components/shared/navigation/Header';

export function AppPublicOnlyLayout({
  children,
  title,
}: Readonly<{
  children: ReactNode;
  title?: string;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <Header title={title} showUserMenu={false} />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">{children}</div>
      </main>
    </div>
  );
}
