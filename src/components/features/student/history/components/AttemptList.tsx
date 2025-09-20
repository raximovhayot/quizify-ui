import { StudentAttemptDTO } from '@/components/features/student/quiz/types/attempt';

import { AttemptListItem } from './AttemptListItem';

interface AttemptListProps {
  items: StudentAttemptDTO[];
  emptyLabel: string;
}

export function AttemptList({ items, emptyLabel }: Readonly<AttemptListProps>) {
  if (!items || items.length === 0) {
    return <div className="text-sm text-muted-foreground">{emptyLabel}</div>;
  }
  return (
    <ul className="divide-y rounded-md border">
      {items.map((a) => (
        <AttemptListItem key={a.id} attempt={a} />
      ))}
    </ul>
  );
}
