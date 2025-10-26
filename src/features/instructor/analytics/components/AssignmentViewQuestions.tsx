'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useQuestionAnalytics } from '../hooks';
import { 
  QuestionsDisplayList, 
  QuestionsDisplayHeader 
} from '@/features/instructor/shared/components/questions';
import { Badge } from '@/components/ui/badge';
import { QuestionType } from '@/features/instructor/quiz/types/question';

interface AssignmentViewQuestionsProps {
  assignmentId: number;
}

export function AssignmentViewQuestions({
  assignmentId,
}: Readonly<AssignmentViewQuestionsProps>) {
  const t = useTranslations();
  const { data: questions, isLoading, error, refetch } = useQuestionAnalytics(assignmentId);
  const [showAnswers, setShowAnswers] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              {t('instructor.assignment.questions.loading', {
                fallback: 'Loading questions...',
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {t('common.error.title', {
                fallback: 'Something went wrong',
              })}
            </h3>
            <p className="text-muted-foreground mb-4">
              {t('common.error.description', {
                fallback:
                  'There was a problem loading the data. Please try again.',
              })}
            </p>
            <Button onClick={() => refetch()}>
              {t('common.retry', { fallback: 'Try Again' })}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const questionsList = questions || [];

  // Convert analytics questions to QuestionDataDto format
  const displayQuestions = questionsList.map((q) => ({
    id: q.questionId,
    quizId: 0, // Not needed for display
    content: q.questionText,
    questionType: q.questionType as QuestionType,
    points: q.points,
    order: 0,
    explanation: '',
    answers: [], // Analytics questions don't include options
  }));

  return (
    <div className="space-y-6">
      <QuestionsDisplayHeader
        count={questionsList.length}
        title={t('instructor.assignment.questions.title', {
          fallback: 'Questions',
        })}
        subtitle={questionsList.length > 0 
          ? t('common.questionsInQuiz', {
              count: questionsList.length,
              fallback: '{count} {count, plural, one {question} other {questions}} in this assignment',
            })
          : t('instructor.assignment.questions.empty', { fallback: 'No questions available' })}
        showAnswers={showAnswers}
        onToggleShowAnswers={() => setShowAnswers(!showAnswers)}
      />
      
      <QuestionsDisplayList
        questions={displayQuestions}
        showAnswers={showAnswers}
        showOrder={true}
        emptyTitle={t('instructor.assignment.questions.empty', {
          fallback: 'No questions available',
        })}
        emptyDescription=""
        renderAdditionalBadges={(question, index) => {
          const analyticsData = questionsList[index];
          if (!analyticsData) return null;
          
          return (
            <Badge
              variant="secondary"
              className={`text-xs font-medium ${
                analyticsData.correctPercentage >= 70
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800'
                  : analyticsData.correctPercentage >= 40
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800'
              }`}
              title={t('instructor.assignment.questions.correctRate', {
                fallback: 'Correct %',
              })}
            >
              {analyticsData.correctPercentage.toFixed(1)}% {t('instructor.assignment.questions.correctRate', {
                fallback: 'Correct',
              })}
            </Badge>
          );
        }}
      />
    </div>
  );
}
