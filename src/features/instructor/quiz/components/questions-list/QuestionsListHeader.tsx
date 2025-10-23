'use client';

import { Eye, EyeOff, Plus } from 'lucide-react';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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
    <Card className="border-border/50 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-bold text-primary">{count}</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {t('common.questions', {
                fallback: 'Questions',
              })}
            </h2>
            <p className="text-xs text-muted-foreground">
              {count === 0
                ? t('common.questionsEmpty.subtitle', { fallback: 'No questions yet' })
                : count === 1
                  ? t('common.questionsCount.singular', { fallback: '1 question in this quiz' })
                  : t('common.questionsCount.plural', { count, fallback: `${count} questions in this quiz` })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap md:ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleShowAnswers}
            aria-pressed={showAnswers}
            className="flex-1 md:flex-none hover:bg-primary/5 hover:border-primary/30 transition-colors"
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
            className="flex-1 md:flex-none shadow-sm hover:shadow transition-shadow"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('common.addQuestion', { fallback: 'Add Question' })}
          </Button>
        </div>
      </div>
    </Card>
  );
}
