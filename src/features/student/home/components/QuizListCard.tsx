import React, { JSX } from 'react';

import { QuizDataDTO } from '@/features/instructor/quiz/types/quiz';
import { DataCard } from '@/components/shared/ui/DataCard';

import { ListSkeleton } from '@/components/atomic/molecules';
import { QuizSimpleList } from './QuizSimpleList';

interface QuizListCardProps {
  title: string;
  icon: JSX.Element;
  isLoading: boolean;
  hasError: boolean;
  errorText: string;
  items: QuizDataDTO[];
  emptyLabel: string;
}

export function QuizListCard({
  title,
  icon,
  isLoading,
  hasError,
  errorText,
  items,
  emptyLabel,
}: QuizListCardProps) {
  return (
    <DataCard
      title={title}
      icon={icon}
      isLoading={isLoading}
      error={hasError ? errorText : undefined}
    >
      {isLoading ? (
        <ListSkeleton />
      ) : (
        <QuizSimpleList
          items={items || []}
          emptyLabel={emptyLabel}
          icon={icon}
        />
      )}
    </DataCard>
  );
}

export default QuizListCard;
