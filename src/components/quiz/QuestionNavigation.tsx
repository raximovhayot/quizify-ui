'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface QuestionNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  answeredQuestions: Set<number>;
  flaggedQuestions: Set<number>;
  onNavigate: (questionIndex: number) => void;
  onToggleFlag?: (questionIndex: number) => void;
  className?: string;
}

/**
 * QuestionNavigation component for navigating through quiz questions
 * Features:
 * - Next/Previous buttons
 * - Question number grid for direct navigation
 * - Visual indicators (answered/unanswered/flagged)
 * - Progress bar
 */
export function QuestionNavigation({
  currentQuestion,
  totalQuestions,
  answeredQuestions,
  flaggedQuestions,
  onNavigate,
  onToggleFlag,
  className,
}: QuestionNavigationProps) {
  const progress = (answeredQuestions.size / totalQuestions) * 100;

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      onNavigate(currentQuestion - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      onNavigate(currentQuestion + 1);
    }
  };

  const handleToggleFlag = () => {
    onToggleFlag?.(currentQuestion);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progress</span>
          <span>
            {answeredQuestions.size} / {totalQuestions}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Grid */}
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
        {Array.from({ length: totalQuestions }, (_, i) => {
          const isAnswered = answeredQuestions.has(i);
          const isFlagged = flaggedQuestions.has(i);
          const isCurrent = i === currentQuestion;

          return (
            <button
              key={i}
              onClick={() => onNavigate(i)}
              className={cn(
                'relative flex h-10 w-10 items-center justify-center rounded-md text-sm font-medium transition-colors',
                isCurrent && 'ring-2 ring-primary ring-offset-2',
                isAnswered && !isCurrent && 'bg-primary text-primary-foreground',
                !isAnswered && !isCurrent && 'bg-muted text-muted-foreground hover:bg-muted/80',
                isCurrent && isAnswered && 'bg-primary text-primary-foreground',
                isCurrent && !isAnswered && 'bg-muted text-muted-foreground'
              )}
            >
              {i + 1}
              {isFlagged && (
                <Flag className="absolute -right-1 -top-1 h-3 w-3 fill-yellow-500 text-yellow-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="flex-1"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        {onToggleFlag && (
          <Button
            variant="outline"
            onClick={handleToggleFlag}
            className={cn(
              'flex-shrink-0',
              flaggedQuestions.has(currentQuestion) && 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 dark:text-yellow-500'
            )}
          >
            <Flag className={cn('h-4 w-4', flaggedQuestions.has(currentQuestion) && 'fill-current')} />
          </Button>
        )}

        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentQuestion === totalQuestions - 1}
          className="flex-1"
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-primary" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-muted" />
          <span>Unanswered</span>
        </div>
        {onToggleFlag && (
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            <span>Flagged</span>
          </div>
        )}
      </div>
    </div>
  );
}
