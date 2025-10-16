import React, { JSX } from 'react';

import { DataCard } from '@/components/shared/ui/DataCard';
import { RegistrationSimpleList } from '@/features/student/home/components/RegistrationSimpleList';
import { ListRowsSkeleton } from '@/components/shared/ui/ListRowsSkeleton';
import { AssignmentRegistrationItem } from '@/features/student/assignment/services/studentAssignmentService';

interface RegistrationListCardProps {
  title: string;
  icon: JSX.Element;
  isLoading: boolean;
  hasError: boolean;
  errorText: string;
  items?: AssignmentRegistrationItem[];
  emptyLabel: string;
}

export function RegistrationListCard({
  title,
  icon,
  isLoading,
  hasError,
  errorText,
  items,
  emptyLabel,
}: RegistrationListCardProps) {
  return (
    <DataCard title={title} icon={icon} isLoading={isLoading} error={hasError ? errorText : undefined}>
      {isLoading ? (
        <ListRowsSkeleton />
      ) : (
        <RegistrationSimpleList items={items || []} emptyLabel={emptyLabel} icon={icon} />
      )}
    </DataCard>
  );
}

export default RegistrationListCard;
