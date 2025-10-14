'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, LogIn } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { useTranslations } from 'next-intl';

import { useJoinQuiz } from '@/components/features/student/home/hooks/useJoinQuiz';
import { createJoinSchema } from '@/components/features/student/home/schemas/joinSchema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export function JoinQuizCard() {
  const t = useTranslations();
  const joinQuiz = useJoinQuiz();

  const joinSchema = createJoinSchema(t);

  const form = useForm<z.infer<typeof joinSchema>>({
    resolver: zodResolver(joinSchema),
    defaultValues: { code: '' },
    mode: 'onSubmit',
  });

  async function onSubmit(values: z.infer<typeof joinSchema>) {
    const code = values.code.trim();
    if (!code) return;
    try {
      await joinQuiz.mutateAsync({ code });
    } catch {
      form.setError('code', {
        type: 'server',
        message: t('student.join.error', {
          fallback: 'Failed to join quiz. Check the code and try again.',
        }),
      });
    }
  }

  return (
    <Card className="md:col-span-2">
      <CardHeader data-slot="card-header" className="text-center">
        <div className="font-semibold text-lg md:text-xl">
          {t('student.home.joinTitle', { fallback: 'Join a quiz' })}
        </div>
      </CardHeader>
      <CardContent data-slot="card-content">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-auto w-full max-w-xl"
          >
            <Controller
              control={form.control}
              name="code"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="code" className="text-base font-medium">
                    {t('student.home.joinLabel', { fallback: 'Join code' })}
                  </FieldLabel>
                  <FieldContent>
                    <div className="flex flex-col md:flex-row items-stretch gap-3">
                      <Input
                        id="code"
                        className="h-12 text-base flex-1"
                        placeholder={t('student.home.joinPlaceholder', {
                          fallback: 'Enter join code',
                        })}
                        aria-invalid={!!fieldState.error}
                        aria-describedby={fieldState.error ? 'code-error' : undefined}
                        {...field}
                      />
                      <Button
                        type="submit"
                        size="lg"
                        className="h-12 shrink-0"
                        disabled={form.formState.isSubmitting}
                        aria-label={t('student.home.joinButton', {
                          fallback: 'Join',
                        })}
                      >
                        {form.formState.isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            {t('common.pleaseWait', {
                              fallback: 'Please wait...',
                            })}
                          </>
                        ) : (
                          <>
                            <LogIn className="mr-2 h-5 w-5" />
                            {t('student.home.joinButton', { fallback: 'Join' })}
                          </>
                        )}
                      </Button>
                    </div>
                    <FieldDescription>
                      {t('student.home.joinDescription', {
                        fallback: 'Enter the code provided by your instructor.',
                      })}
                    </FieldDescription>
                    <FieldError id="code-error">{fieldState.error?.message}</FieldError>
                  </FieldContent>
                </Field>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default JoinQuizCard;
