'use client';

import { FileQuestion } from 'lucide-react';

import { useTranslations } from 'next-intl';

import { Card, CardContent } from '@/components/ui/card';

interface QuestionsTabContentProps {
  assignmentId: number;
}

export function QuestionsTabContent({
  assignmentId: _assignmentId,
}: Readonly<QuestionsTabContentProps>) {
  const t = useTranslations();

  return (
    <Card>
      <CardContent className="py-12">
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <FileQuestion className="h-12 w-12 text-muted-foreground" />
          <div>
            <h3 className="font-semibold text-lg">
              {t('common.questionAnalytics', { fallback: 'Question Analytics' })}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t('common.questionAnalyticsNotAvailable', {
                fallback:
                  'Question-level analytics require detailed attempt data and will be available in a future update.',
              })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
