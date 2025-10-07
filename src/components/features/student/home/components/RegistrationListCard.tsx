import React, { JSX } from 'react';

import { DataCard } from '@/components/shared/ui/DataCard';
import { RegistrationSimpleList } from '@/components/features/student/home/components/RegistrationSimpleList';
import { ListSkeleton } from '@/components/features/student/home/components/ListSkeleton';
import { AssignmentRegistrationItem } from '@/components/features/student/assignment/services/studentAssignmentService';

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
        <ListSkeleton />
      ) : (
        <RegistrationSimpleList items={items || []} emptyLabel={emptyLabel} icon={icon} />
      )}
    </DataCard>
  );
}

export default RegistrationListCard;
