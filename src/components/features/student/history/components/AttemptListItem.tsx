import { useFormatter, useTranslations } from 'next-intl';

import { AttemptListingData } from '@/components/features/student/quiz/types/attempt';
import { Item, ItemContent, ItemTitle } from '@/components/ui/item';

export function AttemptListItem({
  attempt,
}: Readonly<{ attempt: AttemptListingData }>) {
  const t = useTranslations();
  const f = useFormatter();

  const statusLabel = attempt.status
    ? t(`student.history.status.${(attempt.status as string).toLowerCase()}`, {
        fallback: attempt.status,
      })
    : undefined;

  return (
    <Item variant="outline">
      <ItemContent>
        <ItemTitle className="font-medium line-clamp-1">{attempt.title}</ItemTitle>
        <div className="text-xs text-muted-foreground mt-0.5">
          {statusLabel}
          {typeof attempt.correct === 'number' &&
            typeof attempt.total === 'number' && (
              <span>
                {' '}· {f.number(attempt.correct)}/{f.number(attempt.total)}
              </span>
            )}
        </div>
      </ItemContent>
    </Item>
  );
}
