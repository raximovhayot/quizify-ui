'use client';

import { useMemo, useState } from 'react';

import { useTranslations } from 'next-intl';

import {
  QuestionDataDto,
  QuestionType,
} from '@/features/instructor/quiz/types/question';
import { QuizDataDTO } from '@/features/instructor/quiz/types/quiz';
import { RichTextDisplay } from '@/components/shared/form/RichTextEditor';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface QuizViewProps {
  quiz: QuizDataDTO;
  questions: QuestionDataDto[];
  className?: string;
}

export function QuizView({ quiz: _quiz, questions, className }: QuizViewProps) {
  const t = useTranslations();
  const [showAnswers, setShowAnswers] = useState(false);
  const [showExplanations, setShowExplanations] = useState(false);

  const sortedQuestions = useMemo(() => {
    const list = [...questions];
    list.sort((a, b) => a.order - b.order);
    return list;
  }, [questions]);

  return (
    <div className={className}>
      {/* Simple controls section */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div className="flex items-center gap-2">
          <Switch
            id="toggle-answers"
            checked={showAnswers}
            onCheckedChange={setShowAnswers}
          />
          <Label htmlFor="toggle-answers" className="cursor-pointer">
            {t('student.quiz.showAnswers', { default: 'Show answers' })}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="toggle-explanations"
            checked={showExplanations}
            onCheckedChange={setShowExplanations}
          />
          <Label htmlFor="toggle-explanations" className="cursor-pointer">
            {t('student.quiz.showExplanations', {
              default: 'Show explanations',
            })}
          </Label>
        </div>
      </div>

      <div className="space-y-4">
        {sortedQuestions.map((q, idx) => (
          <Card key={q.id}>
            <CardHeader data-slot="card-header">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-muted-foreground">
                    {t('student.quiz.questionNumber', {
                      default: 'Question {n}',
                      n: idx + 1,
                    })}
                  </div>
                  <div className="mt-1 font-medium break-words">
                    {q.content}
                  </div>
                </div>
                <Badge variant="secondary" className="self-start shrink-0">
                  {formatQuestionType(q.questionType, t)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent data-slot="card-content" className="space-y-2">
              {/* Answers */}
              {showAnswers && renderAnswers(q, t)}

              {/* Explanations */}
              {showExplanations && q.explanation && (
                <div className="mt-2">
                  <div className="text-sm text-muted-foreground">
                    {t('student.quiz.explanation', { default: 'Explanation' })}
                  </div>
                  <div className="text-sm break-words">{q.explanation}</div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function formatQuestionType(
  type: QuestionType,
  t: ReturnType<typeof useTranslations>
) {
  return t('student.quiz.types.multipleChoice', {
    default: 'Multiple choice',
  });
}

function renderAnswers(
  q: QuestionDataDto,
  t: ReturnType<typeof useTranslations>
) {
  if (!q.answers || q.answers.length === 0) return null;

  const sortedAnswers = [...q.answers].sort((a, b) => a.order - b.order);
  return (
    <div>
      <div className="text-sm text-muted-foreground mb-2">
        {t('student.quiz.answers', { default: 'Answers' })}
      </div>
      <ul className="space-y-2">
        {sortedAnswers.map((a) => (
          <li key={a.order} className={a.correct ? 'font-semibold' : ''}>
            <div className="flex items-start gap-2">
              <span className="text-sm mt-1">•</span>
              <div className="flex-1">
                <RichTextDisplay content={a.content} className="text-sm" />
                {a.correct && <span className="ml-2">✓</span>}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
