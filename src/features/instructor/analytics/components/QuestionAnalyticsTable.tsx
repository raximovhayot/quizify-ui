'use client';

import { BarChart3 } from 'lucide-react';

import { useTranslations } from 'next-intl';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { sanitizeHtml } from '@/lib/sanitize';

import { QuestionAnalytics } from '../types/analytics';

interface QuestionAnalyticsTableProps {
  analytics: QuestionAnalytics[];
  loading?: boolean;
}

export function QuestionAnalyticsTable({
  analytics,
  loading,
}: QuestionAnalyticsTableProps) {
  const t = useTranslations();

  if (loading) {
    return <QuestionAnalyticsTableSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          <CardTitle>
            {t('instructor.analytics.questionPerformance', {
              fallback: 'Question Performance',
            })}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {analytics.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            {t('instructor.analytics.noQuestionData', {
              fallback: 'No question data available',
            })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">
                    {t('instructor.analytics.question', {
                      fallback: 'Question',
                    })}
                  </TableHead>
                  <TableHead>
                    {t('instructor.analytics.type', { fallback: 'Type' })}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('instructor.analytics.attempts', {
                      fallback: 'Attempts',
                    })}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('instructor.analytics.correctRate', {
                      fallback: 'Correct %',
                    })}
                  </TableHead>
                  <TableHead className="w-[200px]">
                    {t('instructor.analytics.distribution', {
                      fallback: 'Distribution',
                    })}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.map((question, index) => (
                  <TableRow key={question.questionId}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {t('instructor.analytics.questionNumber', {
                            fallback: 'Q{{number}}',
                            number: index + 1,
                          })}
                        </div>
                        <div
                          className="line-clamp-2 text-sm text-muted-foreground"
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(question.questionText || ''),
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {question.questionType.replace('_', ' ')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {question.totalAttempts}
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className={`font-medium ${
                          question.correctPercentage >= 70
                            ? 'text-green-600'
                            : question.correctPercentage >= 50
                              ? 'text-orange-600'
                              : 'text-red-600'
                        }`}
                      >
                        {question.correctPercentage.toFixed(1)}%
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Progress
                            value={question.correctPercentage}
                            className="h-2"
                          />
                        </div>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span className="text-green-600">
                            ✓ {question.correctCount}
                          </span>
                          <span className="text-red-600">
                            ✗ {question.incorrectCount}
                          </span>
                          {question.unansweredCount > 0 && (
                            <span className="text-gray-400">
                              – {question.unansweredCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QuestionAnalyticsTableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-56" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
