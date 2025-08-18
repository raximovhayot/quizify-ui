'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { StudentQuizService } from '@/components/features/student/quiz/services/studentQuizService';
import { StudentAttemptDTO } from '@/components/features/student/quiz/types/attempt';
import { ROUTES_APP } from '@/components/features/student/routes';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function StudentHistoryClient() {
  const t = useTranslations();
  const { data: session } = useSession();

  const historyQuery = useQuery({
    queryKey: ['student', 'attempts', 'history'],
    queryFn: async ({ signal }): Promise<StudentAttemptDTO[]> =>
      StudentQuizService.getAttemptHistory(session?.accessToken, signal),
    enabled: true,
    staleTime: 60_000,
  });

  return (
    <Card>
      <CardHeader
        data-slot="card-header"
        className="flex flex-row items-center justify-between"
      >
        <div className="font-medium">
          {t('student.history.title', { fallback: 'Attempt history' })}
        </div>
        {historyQuery.isLoading && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent data-slot="card-content">
        {historyQuery.isError ? (
          <div className="text-destructive text-sm">
            {t('student.history.loadError', {
              fallback: 'Failed to load history',
            })}
          </div>
        ) : (
          <AttemptList
            items={historyQuery.data || []}
            emptyLabel={t('student.history.empty', {
              fallback: 'No attempts yet',
            })}
          />
        )}
      </CardContent>
    </Card>
  );
}

function AttemptList({
  items,
  emptyLabel,
}: {
  items: StudentAttemptDTO[];
  emptyLabel: string;
}) {
  if (!items || items.length === 0) {
    return <div className="text-sm text-muted-foreground">{emptyLabel}</div>;
  }
  return (
    <ul className="divide-y rounded-md border">
      {items.map((a) => (
        <li key={a.id} className="p-3 hover:bg-accent/40">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{a.quizTitle}</div>
              <div className="text-xs text-muted-foreground">
                {formatDate(a.finishedAt || a.startedAt)}
                {typeof a.score === 'number' && <span> · {a.score}</span>}
                {a.status && <span> · {a.status}</span>}
              </div>
            </div>
            <a
              className="text-primary text-sm"
              href={`${ROUTES_APP.baseUrl()}/quizzes/${a.quizId}`}
            >
              {`View`}
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}

function formatDate(iso?: string) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}
