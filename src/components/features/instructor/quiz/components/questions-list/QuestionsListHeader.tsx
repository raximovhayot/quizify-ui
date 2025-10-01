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
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {t('instructor.quiz.questions.title', {
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
          >
            {showAnswers ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                {t('instructor.quiz.questions.hideAnswers', {
                  fallback: 'Hide answers',
                })}
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                {t('instructor.quiz.questions.showAnswers', {
                  fallback: 'Show answers',
                })}
              </>
            )}
          </Button>
          <Button onClick={onAddQuestion} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t('instructor.quiz.question.add', { fallback: 'Add Question' })}
          </Button>
        </div>
      </div>
    </CardHeader>
  );
}
