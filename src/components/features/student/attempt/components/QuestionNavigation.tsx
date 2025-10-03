'use client';

import { ChevronLeft, ChevronRight, Flag } from 'lucide-react';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { AttemptQuestion } from '../types/attempt';

interface QuestionNavigationProps {
  questions: AttemptQuestion[];
  currentQuestionIndex: number;
  onNavigate: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export function QuestionNavigation({
  questions,
  currentQuestionIndex,
  onNavigate,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
}: QuestionNavigationProps) {
  const t = useTranslations();

  return (
    <div className="space-y-4">
      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-4">
        <Button
          onClick={onPrevious}
          disabled={!canGoPrevious}
          variant="outline"
          size="sm"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t('student.attempt.previous', { fallback: 'Previous' })}
        </Button>

        <span className="text-sm text-muted-foreground">
          {t('student.attempt.questionNumber', {
            fallback: 'Question {{current}} of {{total}}',
            current: currentQuestionIndex + 1,
            total: questions.length,
          })}
        </span>

        <Button
          onClick={onNext}
          disabled={!canGoNext}
          variant="outline"
          size="sm"
        >
          {t('student.attempt.next', { fallback: 'Next' })}
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Question grid */}
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
        {questions.map((question, index) => (
          <button
            key={question.id}
            onClick={() => onNavigate(index)}
            className={cn(
              'aspect-square rounded-md border-2 text-sm font-medium transition-colors relative',
              index === currentQuestionIndex
                ? 'border-primary bg-primary text-primary-foreground'
                : question.isAnswered
                  ? 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-400'
                  : 'border-muted-foreground/30 hover:border-muted-foreground/50'
            )}
          >
            {index + 1}
            {question.isFlagged && (
              <Flag
                className="absolute -top-1 -right-1 h-3 w-3 fill-orange-500 text-orange-500"
                aria-label="Flagged"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
