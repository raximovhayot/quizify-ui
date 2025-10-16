import type { ReactNode } from 'react';

import { DataCard } from '@/components/shared/ui/DataCard';

interface HistoryCardProps {
  title: string;
  isLoading?: boolean;
  error?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function HistoryCard({
  title,
  isLoading,
  error,
  actions,
  children,
}: Readonly<HistoryCardProps>) {
  return (
    <DataCard
      title={title}
      isLoading={isLoading}
      error={error}
      actions={actions}
    >
      {children}
    </DataCard>
  );
}
