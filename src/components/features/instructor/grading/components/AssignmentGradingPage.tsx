'use client';

import { ArrowLeft, FileEdit } from 'lucide-react';

import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';

import { ContentPlaceholder } from '@/components/shared/ui/ContentPlaceholder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useAssignmentGrading } from '../hooks/useGrading';
import { EssayGradingTable } from './EssayGradingTable';

export function AssignmentGradingPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const assignmentId = Number(params?.id);

  const {
    data: grading,
    isLoading,
    error,
  } = useAssignmentGrading(assignmentId);

  if (error) {
    return (
      <ContentPlaceholder
        title={t('instructor.grading.error.title', {
          fallback: 'Failed to load grading data',
        })}
        description={t('instructor.grading.error.description', {
          fallback: 'There was an error loading the essay answers.',
        })}
      />
    );
  }

  const stats = grading
    ? [
        {
          label: t('instructor.grading.totalEssayQuestions', {
            fallback: 'Essay Questions',
          }),
          value: grading.totalEssayQuestions,
        },
        {
          label: t('instructor.grading.totalAnswers', {
            fallback: 'Total Answers',
          }),
          value: grading.totalEssayAnswers,
        },
        {
          label: t('instructor.grading.pending', { fallback: 'Pending' }),
          value: grading.pendingGrading,
          color: 'text-orange-600',
        },
        {
          label: t('instructor.grading.graded', { fallback: 'Graded' }),
          value: grading.gradedCount,
          color: 'text-green-600',
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold">
              {t('instructor.grading.title', { fallback: 'Essay Grading' })}
            </h2>
          </div>
          {grading && (
            <p className="text-sm text-muted-foreground">
              {grading.assignmentTitle}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      {grading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <FileEdit className={`h-4 w-4 ${stat.color || ''}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color || ''}`}>
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Essay Answers Table */}
      {grading && (
        <EssayGradingTable essays={grading.essayAnswers} loading={isLoading} />
      )}
    </div>
  );
}
