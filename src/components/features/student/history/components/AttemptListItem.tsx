import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { AttemptListingData } from '@/components/features/student/quiz/types/attempt';
import { ROUTES_APP } from '@/components/features/student/routes';

export function AttemptListItem({
  attempt,
}: Readonly<{ attempt: AttemptListingData }>) {
  const t = useTranslations();
  const title = attempt.quizTitle || attempt.title;
  const hasQuizLink = typeof attempt.quizId === 'number' && attempt.quizId > 0;
  return (
    <li className="p-3 hover:bg-accent/40">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-xs text-muted-foreground">
            {formatDate(
              (attempt.finishedAt as string | undefined) ||
                (attempt.startedAt as string | undefined)
            )}
            {typeof attempt.score === 'number' && (
              <span> · {attempt.score}</span>
            )}
            {attempt.status && <span> · {attempt.status}</span>}
          </div>
        </div>
        {hasQuizLink ? (
          <Link
            className="text-primary text-sm"
            href={`${ROUTES_APP.baseUrl()}/quizzes/${attempt.quizId}`}
          >
            {t('common.view', { fallback: 'View' })}
          </Link>
        ) : (
          <span className="text-muted-foreground text-sm">
            {t('common.view', { fallback: 'View' })}
          </span>
        )}
      </div>
    </li>
  );
}

function formatDate(iso?: string) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso as string;
  }
}
