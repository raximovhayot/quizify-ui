import { AttemptListingData } from '@/features/student/quiz/types/attempt';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { ItemGroup } from '@/components/ui/item';
import { FileQuestion } from 'lucide-react';

import { AttemptListItem } from './AttemptListItem';

interface AttemptListProps {
  items: AttemptListingData[];
  emptyLabel: string;
}

export function AttemptList({ items, emptyLabel }: Readonly<AttemptListProps>) {
  if (!items || items.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileQuestion className="size-6" />
          </EmptyMedia>
          <EmptyTitle>{emptyLabel}</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }
  return (
    <ItemGroup>
      {items.map((a) => (
        <AttemptListItem key={a.id} attempt={a} />
      ))}
    </ItemGroup>
  );
}
