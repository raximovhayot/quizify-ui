import { Loader2 } from 'lucide-react';

import React, { JSX } from 'react';

import { QuizDataDTO } from '@/components/features/instructor/quiz/types/quiz';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

import { ListSkeleton } from './ListSkeleton';
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
    <Card>
      <CardHeader
        data-slot="card-header"
        className="flex flex-row items-center justify-between"
      >
        <div className="flex items-center gap-2 font-medium">
          {icon}
          <span>{title}</span>
        </div>
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent data-slot="card-content">
        {hasError ? (
          <div className="text-destructive text-sm">{errorText}</div>
        ) : isLoading ? (
          <ListSkeleton />
        ) : (
          <QuizSimpleList
            items={items || []}
            emptyLabel={emptyLabel}
            icon={icon}
          />
        )}
      </CardContent>
    </Card>
  );
}

export default QuizListCard;
