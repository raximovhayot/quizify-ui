'use client';

import { Eye, EyeOff, FileText, Plus } from 'lucide-react';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';

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
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between py-2">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5" />
        <h2 className="text-xl font-semibold">
          {t('common.questions', {
            fallback: 'Questions',
          })}{' '}
          ({count})
        </h2>
      </div>
      <div className="flex items-center gap-2 flex-wrap md:ml-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleShowAnswers}
          aria-pressed={showAnswers}
          className="flex-1 md:flex-none"
        >
          {showAnswers ? (
            <>
              <EyeOff className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">
                {t('common.hideAnswers', {
                  fallback: 'Hide answers',
                })}
              </span>
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">
                {t('common.showAnswers', {
                  fallback: 'Show answers',
                })}
              </span>
            </>
          )}
        </Button>
        <Button
          onClick={onAddQuestion}
          size="sm"
          className="flex-1 md:flex-none"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('common.addQuestion', { fallback: 'Add Question' })}
        </Button>
      </div>
    </div>
  );
}
