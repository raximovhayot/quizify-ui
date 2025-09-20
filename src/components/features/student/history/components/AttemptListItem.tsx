import { useTranslations } from 'next-intl';
import { StudentAttemptDTO } from '@/components/features/student/quiz/types/attempt';
import { ROUTES_APP } from '@/components/features/student/routes';

export function AttemptListItem({ attempt }: { attempt: StudentAttemptDTO }) {
  const t = useTranslations();
  return (
    <li className="p-3 hover:bg-accent/40">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">{attempt.quizTitle}</div>
          <div className="text-xs text-muted-foreground">
            {formatDate(attempt.finishedAt || attempt.startedAt)}
            {typeof attempt.score === 'number' && <span> · {attempt.score}</span>}
            {attempt.status && <span> · {attempt.status}</span>}
          </div>
        </div>
        <a className="text-primary text-sm" href={`${ROUTES_APP.baseUrl()}/quizzes/${attempt.quizId}`}>
          {t('common.view', { fallback: 'View' })}
        </a>
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
