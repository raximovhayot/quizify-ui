'use client';

import { Flag } from 'lucide-react';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { QuestionType } from '@/components/features/instructor/quiz/types/question';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { sanitizeHtml } from '@/lib/sanitize';

import { AttemptQuestion } from '../types/attempt';

interface QuestionDisplayProps {
  question: AttemptQuestion;
  questionNumber: number;
  onAnswerChange: (answer: unknown) => void;
  onSaveAnswer: () => void;
  onFlag: () => void;
  isSaving: boolean;
}

export function QuestionDisplay({
  question,
  questionNumber,
  onAnswerChange,
  onSaveAnswer,
  onFlag,
  isSaving,
}: QuestionDisplayProps) {
  const t = useTranslations();
  const [currentAnswer, setCurrentAnswer] = useState<unknown>(
    question.studentAnswer || null
  );

  const handleAnswerChange = (answer: unknown) => {
    setCurrentAnswer(answer);
    onAnswerChange(answer);
  };

  const renderAnswerInput = () => {
    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.TRUE_FALSE:
        return (
          <RadioGroup
            value={currentAnswer as string}
            onValueChange={handleAnswerChange}
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={String(index)} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case QuestionType.MULTIPLE_RESPONSE:
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => {
              const selectedIndexes = (currentAnswer as number[]) || [];
              const isChecked = selectedIndexes.includes(index);

              return (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`option-${index}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      const newSelected = checked
                        ? [...selectedIndexes, index]
                        : selectedIndexes.filter((i) => i !== index);
                      handleAnswerChange(newSelected);
                    }}
                  />
                  <Label htmlFor={`option-${index}`} className="cursor-pointer">
                    {option.text}
                  </Label>
                </div>
              );
            })}
          </div>
        );

      case QuestionType.SHORT_ANSWER:
      case QuestionType.FILL_IN_THE_BLANK:
        return (
          <Input
            value={(currentAnswer as string) || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder={t('student.attempt.typeAnswer', {
              fallback: 'Type your answer here...',
            })}
            className="max-w-md"
          />
        );

      case QuestionType.ESSAY:
        return (
          <Textarea
            value={(currentAnswer as string) || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder={t('student.attempt.typeEssay', {
              fallback: 'Type your essay here...',
            })}
            rows={8}
            className="w-full"
          />
        );

      case QuestionType.MATCHING:
      case QuestionType.ORDERING:
        return (
          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">
              {t('student.attempt.questionTypeNotSupported', {
                fallback:
                  'This question type is not yet supported in the interface. Please contact your instructor.',
              })}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">
            {t('student.attempt.questionLabel', {
              fallback: 'Question {{number}}',
              number: questionNumber,
            })}
            {question.points && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({question.points}{' '}
                {question.points === 1
                  ? t('student.attempt.point', { fallback: 'point' })
                  : t('student.attempt.points', { fallback: 'points' })}
                )
              </span>
            )}
          </CardTitle>
          <Button
            variant={question.isFlagged ? 'default' : 'ghost'}
            size="sm"
            onClick={onFlag}
          >
            <Flag
              className={`h-4 w-4 ${question.isFlagged ? 'fill-current' : ''}`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Question text */}
        <div
          className="prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(question.content) }}
        />

        {/* Answer input */}
        <div className="space-y-4">
          <Label>
            {t('student.attempt.yourAnswer', { fallback: 'Your Answer' })}
          </Label>
          {renderAnswerInput()}
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <Button
            onClick={onSaveAnswer}
            disabled={isSaving || currentAnswer === null}
          >
            {isSaving
              ? t('common.saving', { fallback: 'Saving...' })
              : question.isAnswered
                ? t('student.attempt.updateAnswer', {
                    fallback: 'Update Answer',
                  })
                : t('student.attempt.saveAnswer', {
                    fallback: 'Save Answer',
                  })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
