'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import { useState } from 'react';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { QuizDataDTO } from '@/components/features/instructor/quiz/types/quiz';
import { StudentQuizService } from '@/components/features/student/quiz/services/studentQuizService';
import { ROUTES_APP } from '@/components/features/student/routes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function StudentHomeClient() {
  const t = useTranslations();
  const router = useRouter();
  const { data: session } = useSession();
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);

  const upcomingQuery = useQuery({
    queryKey: ['student', 'quizzes', 'upcoming'],
    queryFn: async ({ signal }): Promise<QuizDataDTO[]> =>
      StudentQuizService.getUpcomingQuizzes(session?.accessToken, signal),
    enabled: true,
    staleTime: 60_000,
  });

  const inProgressQuery = useQuery({
    queryKey: ['student', 'quizzes', 'in-progress'],
    queryFn: async ({ signal }): Promise<QuizDataDTO[]> =>
      StudentQuizService.getInProgressQuizzes(session?.accessToken, signal),
    enabled: true,
    staleTime: 30_000,
  });

  async function handleJoin() {
    if (!code.trim()) return;
    try {
      setJoining(true);
      const resp = await StudentQuizService.joinWithCode(
        code.trim(),
        session?.accessToken
      );
      let quizId: number | undefined;
      const maybeQuiz = resp as QuizDataDTO;
      const maybeJoin = resp as { quizId?: number };
      if (typeof maybeQuiz?.id === 'number') quizId = maybeQuiz.id;
      if (!quizId && typeof maybeJoin?.quizId === 'number')
        quizId = maybeJoin.quizId;
      if (!quizId) throw new Error('No quiz id returned');
      router.push(`${ROUTES_APP.baseUrl()}/quizzes/${quizId}`);
    } catch (e) {
      console.error('Join failed', e);
      alert(
        t('student.join.error', {
          fallback: 'Failed to join quiz. Check the code and try again.',
        })
      );
    } finally {
      setJoining(false);
    }
  }

  const isLoading = upcomingQuery.isLoading || inProgressQuery.isLoading;
  const hasError = upcomingQuery.isError || inProgressQuery.isError;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader data-slot="card-header">
          <div className="font-medium">
            {t('student.home.joinTitle', { fallback: 'Join a quiz' })}
          </div>
        </CardHeader>
        <CardContent data-slot="card-content">
          <div className="flex items-center gap-2 max-w-md">
            <Input
              placeholder={t('student.home.joinPlaceholder', {
                fallback: 'Enter join code',
              })}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleJoin();
              }}
            />
            <Button onClick={handleJoin} disabled={joining || !code.trim()}>
              {joining
                ? t('common.pleaseWait', { fallback: 'Please wait...' })
                : t('student.home.joinButton', { fallback: 'Join' })}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          data-slot="card-header"
          className="flex flex-row items-center justify-between"
        >
          <div className="font-medium">
            {t('student.home.upcoming', { fallback: 'Upcoming quizzes' })}
          </div>
          {upcomingQuery.isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </CardHeader>
        <CardContent data-slot="card-content">
          {hasError ? (
            <div className="text-destructive text-sm">
              {t('student.home.loadError', {
                fallback: 'Failed to load upcoming quizzes',
              })}
            </div>
          ) : (
            <QuizSimpleList
              items={upcomingQuery.data || []}
              emptyLabel={t('student.home.noUpcoming', {
                fallback: 'No upcoming quizzes',
              })}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader
          data-slot="card-header"
          className="flex flex-row items-center justify-between"
        >
          <div className="font-medium">
            {t('student.home.inProgress', { fallback: 'In-progress quizzes' })}
          </div>
          {inProgressQuery.isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </CardHeader>
        <CardContent data-slot="card-content">
          {hasError ? (
            <div className="text-destructive text-sm">
              {t('student.home.loadErrorInProgress', {
                fallback: 'Failed to load in-progress quizzes',
              })}
            </div>
          ) : (
            <QuizSimpleList
              items={inProgressQuery.data || []}
              emptyLabel={t('student.home.noInProgress', {
                fallback: 'No in-progress quizzes',
              })}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function QuizSimpleList({
  items,
  emptyLabel,
}: {
  items: QuizDataDTO[];
  emptyLabel: string;
}) {
  if (!items || items.length === 0) {
    return <div className="text-sm text-muted-foreground">{emptyLabel}</div>;
  }
  return (
    <ul className="divide-y rounded-md border">
      {items.map((q) => (
        <li
          key={q.id}
          className="p-3 hover:bg-accent/40 flex items-center justify-between"
        >
          <div>
            <div className="font-medium">{q.title}</div>
            {q.description && (
              <div className="text-sm text-muted-foreground line-clamp-1">
                {q.description}
              </div>
            )}
          </div>
          <a
            className="text-primary text-sm"
            href={`${ROUTES_APP.baseUrl()}/quizzes/${q.id}`}
          >
            View
          </a>
        </li>
      ))}
    </ul>
  );
}
