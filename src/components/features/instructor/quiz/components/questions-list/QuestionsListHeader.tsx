'use client';

import { Eye, EyeOff, FileText, Plus } from 'lucide-react';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';

export interface QuestionsListHeaderProps {
  count: number;
  showAnswers: boolean;
  onToggleShowAnswers: () => void;
  onAddQuestion: () => void;
}

export function QuestionsListHeader({
  count,
  showAnswers,
  onToggleShowAnswers,
  onAddQuestion,
}: Readonly<QuestionsListHeaderProps>) {
  const t = useTranslations();
  return (
    <CardHeader>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {t('common.questions', {
            fallback: 'Questions',
          })}{' '}
          ({count})
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleShowAnswers}
            aria-pressed={showAnswers}
            className="flex-1 sm:flex-none"
          >
            {showAnswers ? (
              <>
                <EyeOff className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">
                  {t('common.hideAnswers', {
                    fallback: 'Hide answers',
                  })}
                </span>
                <span className="sm:hidden">
                  {t('common.hide', {
                    fallback: 'Hide',
                  })}
                </span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">
                  {t('common.showAnswers', {
                    fallback: 'Show answers',
                  })}
                </span>
                <span className="sm:hidden">
                  {t('common.show', {
                    fallback: 'Show',
                  })}
                </span>
              </>
            )}
          </Button>
          <Button
            onClick={onAddQuestion}
            size="sm"
            className="flex-1 sm:flex-none"
          >
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">
              {t('common.addQuestion', { fallback: 'Add Question' })}
            </span>
            <span className="sm:hidden">
              {t('common.add', { fallback: 'Add' })}
            </span>
          </Button>
        </div>
      </div>
    </CardHeader>
  );
}
