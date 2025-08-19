'use client';

import { useMemo, useState } from 'react';

import { useTranslations } from 'next-intl';

import {
  QuestionDataDto,
  QuestionType,
} from '@/components/features/instructor/quiz/types/question';
import { QuizDataDTO } from '@/components/features/instructor/quiz/types/quiz';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface QuizViewProps {
  quiz: QuizDataDTO;
  questions: QuestionDataDto[];
  className?: string;
}

export function QuizView({ quiz, questions, className }: QuizViewProps) {
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
      <Card className="mb-6">
        <CardHeader data-slot="card-header">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-muted-foreground">{quiz.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant="secondary">
                {t('student.quiz.questions', { fallback: 'Questions' })}:{' '}
                {quiz.numberOfQuestions}
              </Badge>
              <Badge variant="secondary">
                {t('student.quiz.timeLimit', { fallback: 'Time Limit' })}:{' '}
                {quiz.settings?.time === 0
                  ? t('student.quiz.unlimited', { fallback: 'Unlimited' })
                  : `${quiz.settings?.time} ${t('student.quiz.minutes', { fallback: 'min' })}`}
              </Badge>
              <Badge variant="secondary">
                {t('student.quiz.attempts', { fallback: 'Attempts' })}:{' '}
                {quiz.settings?.attempt === 0
                  ? t('student.quiz.unlimited', { fallback: 'Unlimited' })
                  : quiz.settings?.attempt}
              </Badge>
              {(quiz.settings?.shuffleQuestions ||
                quiz.settings?.shuffleAnswers) && (
                <Badge variant="outline">
                  {quiz.settings?.shuffleQuestions && (
                    <span className="mr-1">
                      {t('student.quiz.shuffleQuestions', {
                        fallback: 'Shuffle Questions',
                      })}
                    </span>
                  )}
                  {quiz.settings?.shuffleAnswers && (
                    <span>
                      {t('student.quiz.shuffleAnswers', {
                        fallback: 'Shuffle Answers',
                      })}
                    </span>
                  )}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent data-slot="card-content">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="toggle-answers"
                checked={showAnswers}
                onCheckedChange={setShowAnswers}
              />
              <Label htmlFor="toggle-answers" className="cursor-pointer">
                {t('student.quiz.showAnswers', { fallback: 'Show answers' })}
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
                  fallback: 'Show explanations',
                })}
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {sortedQuestions.map((q, idx) => (
          <Card key={q.id}>
            <CardHeader data-slot="card-header">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">
                    {t('student.quiz.questionNumber', {
                      fallback: 'Question {n}',
                      n: idx + 1,
                    })}
                  </div>
                  <div className="mt-1 font-medium">{q.content}</div>
                </div>
                <Badge variant="secondary">
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
                    {t('student.quiz.explanation', { fallback: 'Explanation' })}
                  </div>
                  <div className="text-sm">{q.explanation}</div>
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
  switch (type) {
    case QuestionType.MULTIPLE_CHOICE:
      return t('student.quiz.types.multipleChoice', {
        fallback: 'Multiple choice',
      });
    case QuestionType.TRUE_FALSE:
      return t('student.quiz.types.trueFalse', { fallback: 'True/False' });
    case QuestionType.SHORT_ANSWER:
      return t('student.quiz.types.shortAnswer', { fallback: 'Short answer' });
    case QuestionType.FILL_IN_BLANK:
      return t('student.quiz.types.fillInBlank', {
        fallback: 'Fill in the blank',
      });
    case QuestionType.ESSAY:
      return t('student.quiz.types.essay', { fallback: 'Essay' });
    case QuestionType.MATCHING:
      return t('student.quiz.types.matching', { fallback: 'Matching' });
    case QuestionType.RANKING:
      return t('student.quiz.types.ranking', { fallback: 'Ranking' });
    default:
      return type;
  }
}

function renderAnswers(
  q: QuestionDataDto,
  t: ReturnType<typeof useTranslations>
) {
  if (q.questionType === QuestionType.TRUE_FALSE) {
    return (
      <div>
        <div className="text-sm text-muted-foreground">
          {t('student.quiz.correctAnswer', { fallback: 'Correct answer' })}
        </div>
        <div className="text-sm font-medium">
          {q.trueFalseAnswer
            ? t('common.true', { fallback: 'True' })
            : t('common.false', { fallback: 'False' })}
        </div>
      </div>
    );
  }

  if (!q.answers || q.answers.length === 0) return null;

  const sortedAnswers = [...q.answers].sort((a, b) => a.order - b.order);
  return (
    <div>
      <div className="text-sm text-muted-foreground">
        {t('student.quiz.answers', { fallback: 'Answers' })}
      </div>
      <ul className="list-disc pl-5 text-sm">
        {sortedAnswers.map((a) => (
          <li key={a.order} className={a.correct ? 'font-semibold' : ''}>
            {a.content}
            {a.correct ? ' ✓' : ''}
          </li>
        ))}
      </ul>
    </div>
  );
}
