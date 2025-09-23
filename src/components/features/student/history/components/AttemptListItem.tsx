import { useFormatter, useTranslations } from 'next-intl';

import { AttemptListingData } from '@/components/features/student/quiz/types/attempt';

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
    <li className="p-3 hover:bg-accent/40">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{attempt.title}</div>
          <div className="text-xs text-muted-foreground">
            {statusLabel}
            {typeof attempt.correct === 'number' &&
              typeof attempt.total === 'number' && (
                <span>
                  {' '}
                  · {f.number(attempt.correct)}/{f.number(attempt.total)}
                </span>
              )}
          </div>
        </div>
      </div>
    </li>
  );
}
