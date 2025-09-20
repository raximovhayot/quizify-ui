'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { QuizDataDTO } from '@/components/features/instructor/quiz/types/quiz';
import { StudentQuizService } from '@/components/features/student/quiz/services/studentQuizService';
import { ROUTES_APP } from '@/components/features/student/routes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export function StudentHomeClient() {
  const t = useTranslations();
  const router = useRouter();
  const { data: session } = useSession();

  const joinSchema = z.object({
    code: z
      .string()
      .trim()
      .min(
        1,
        t('student.home.joinRequired', {
          fallback: 'Please enter a join code.',
        })
      )
      .min(
        4,
        t('student.home.joinMinLength', {
          fallback: 'Code should be at least 4 characters.',
        })
      )
      .max(64)
      .regex(
        /^[A-Za-z0-9-]+$/,
        t('student.home.joinInvalid', {
          fallback: 'Enter a valid code (letters, numbers, dashes).',
        })
      ),
  });

  const form = useForm<z.infer<typeof joinSchema>>({
    resolver: zodResolver(joinSchema),
    defaultValues: { code: '' },
    mode: 'onSubmit',
  });

  const upcomingQuery = useQuery({
    queryKey: ['student', 'quizzes', 'upcoming'],
    queryFn: async ({ signal }): Promise<QuizDataDTO[]> => {
      if (!session?.accessToken) {
        return [];
      }
      try {
        return await StudentQuizService.getUpcomingQuizzes(
          session.accessToken,
          signal
        );
      } catch (error) {
        console.error('Failed to fetch upcoming quizzes:', error);
        return [];
      }
    },
    enabled: !!session?.accessToken,
    staleTime: 60_000,
  });

  const inProgressQuery = useQuery({
    queryKey: ['student', 'quizzes', 'in-progress'],
    queryFn: async ({ signal }): Promise<QuizDataDTO[]> => {
      if (!session?.accessToken) {
        return [];
      }
      try {
        return await StudentQuizService.getInProgressQuizzes(
          session.accessToken,
          signal
        );
      } catch (error) {
        console.error('Failed to fetch in-progress quizzes:', error);
        return [];
      }
    },
    enabled: !!session?.accessToken,
    staleTime: 30_000,
  });

  async function onSubmit(values: z.infer<typeof joinSchema>) {
    const code = values.code.trim();
    if (!code) return;
    try {
      const resp = await StudentQuizService.joinWithCode(
        code,
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
      form.setError('code', {
        type: 'server',
        message: t('student.join.error', {
          fallback: 'Failed to join quiz. Check the code and try again.',
        }),
      });
    }
  }

  // Remove unused variable
  // const _isLoading = upcomingQuery.isLoading || inProgressQuery.isLoading;
  const hasError = upcomingQuery.isError || inProgressQuery.isError;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="md:col-span-2">
        <CardHeader data-slot="card-header">
          <div className="font-medium">
            {t('student.home.joinTitle', { fallback: 'Join a quiz' })}
          </div>
        </CardHeader>
        <CardContent data-slot="card-content">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="max-w-sm flex items-end gap-2"
            >
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>
                      {t('student.home.joinLabel', { fallback: 'Join code' })}
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-9 text-sm"
                        placeholder={t('student.home.joinPlaceholder', {
                          fallback: 'Enter join code',
                        })}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('student.home.joinDescription', {
                        fallback: 'Enter the code provided by your instructor.',
                      })}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                size="sm"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? t('common.pleaseWait', { fallback: 'Please wait...' })
                  : t('student.home.joinButton', { fallback: 'Join' })}
              </Button>
            </form>
          </Form>
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
  const t = useTranslations();
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
            {t('common.view', { fallback: 'View' })}
          </a>
        </li>
      ))}
    </ul>
  );
}
