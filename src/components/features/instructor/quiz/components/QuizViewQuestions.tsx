'use client';

import { Edit, Eye, FileText, Plus } from 'lucide-react';

import { useState } from 'react';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { ROUTES_APP } from '@/components/features/instructor/routes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { QuizDataDTO } from '../types/quiz';

export interface QuizViewQuestionsProps {
  quiz: QuizDataDTO;
}

export function QuizViewQuestions({ quiz }: QuizViewQuestionsProps) {
  const t = useTranslations();
  const router = useRouter();
  const [showAnswers, setShowAnswers] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('instructor.quiz.questions.title', {
              fallback: 'Questions ({count})',
              count: quiz.numberOfQuestions,
            })}
          </CardTitle>
          <div className="flex items-center gap-3">
            <Switch
              id="toggle-show-answers"
              checked={showAnswers}
              onCheckedChange={setShowAnswers}
            />
            <Label
              htmlFor="toggle-show-answers"
              className="cursor-pointer text-sm"
            >
              {t('instructor.quiz.view.questions.showAnswers', {
                fallback: 'Show Answers',
              })}
            </Label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {quiz.numberOfQuestions === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Plus className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {t('instructor.quiz.questions.empty.title', {
                fallback: 'No questions yet',
              })}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {t('instructor.quiz.questions.empty.description', {
                fallback:
                  'Start building your quiz by creating engaging questions that will challenge and educate your students.',
              })}
            </p>
            <Button
              onClick={() => router.push(ROUTES_APP.quizzes.edit(quiz.id))}
              size="lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('instructor.quiz.view.questions.createFirst', {
                fallback: 'Create Question',
              })}
            </Button>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Eye className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {t('instructor.quiz.view.questions.placeholder.title', {
                fallback: 'Questions will be displayed here',
              })}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {t('instructor.quiz.view.questions.placeholder.description', {
                fallback:
                  'The detailed question editor and viewer will be implemented in the next phase.',
              })}
            </p>
            <div className="flex justify-center gap-3">
              <Button
                onClick={() => router.push(ROUTES_APP.quizzes.edit(quiz.id))}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                {t('instructor.quiz.view.questions.editQuestions', {
                  fallback: 'Edit Questions',
                })}
              </Button>
              <Button
                onClick={() => router.push(ROUTES_APP.quizzes.edit(quiz.id))}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {t('instructor.quiz.view.questions.addQuestion', {
                  fallback: 'Add Question',
                })}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
