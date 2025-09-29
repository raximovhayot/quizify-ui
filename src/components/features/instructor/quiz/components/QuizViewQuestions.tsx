'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useCreateQuestion } from '../hooks/useQuestions';
import type { TInstructorQuestionForm } from '../schemas/questionSchema';
import { toInstructorQuestionSaveRequest } from '../schemas/questionSchema';
import { QuestionType } from '../types/question';
import type { QuizDataDTO } from '../types/quiz';
import { QuestionsList } from './QuestionsList';
import { EssayQuestionForm } from './forms/EssayQuestionForm';
import { FillInBlankQuestionForm } from './forms/FillInBlankQuestionForm';
import { MatchingQuestionForm } from './forms/MatchingQuestionForm';
import { MultipleChoiceQuestionForm } from './forms/MultipleChoiceQuestionForm';
import { RankingQuestionForm } from './forms/RankingQuestionForm';
import { ShortAnswerQuestionForm } from './forms/ShortAnswerQuestionForm';
import { TrueFalseQuestionForm } from './forms/TrueFalseQuestionForm';

export interface QuizViewQuestionsProps {
  quiz: QuizDataDTO;
}

export function QuizViewQuestions({ quiz }: QuizViewQuestionsProps) {
  const t = useTranslations();
  const [openCreate, setOpenCreate] = useState(false);
  const [selectedType, setSelectedType] = useState<QuestionType>(
    QuestionType.MULTIPLE_CHOICE
  );
  const createQuestion = useCreateQuestion();

  const handleCreate = async (formData: TInstructorQuestionForm) => {
    const payload = toInstructorQuestionSaveRequest(formData);
    await createQuestion.mutateAsync(payload);
    setOpenCreate(false);
  };

  return (
    <>
      <QuestionsList
        quizId={quiz.id}
        onAddQuestion={() => setOpenCreate(true)}
      />

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t('instructor.quiz.question.create.title', {
                fallback: 'Create Question',
              })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-question-type">
                {t('instructor.quiz.question.type.label', {
                  fallback: 'Question type',
                })}
              </Label>
              <Select
                value={selectedType}
                onValueChange={(val) => setSelectedType(val as QuestionType)}
                disabled={createQuestion.isPending}
              >
                <SelectTrigger id="create-question-type">
                  <SelectValue
                    placeholder={t(
                      'instructor.quiz.question.type.placeholder',
                      {
                        fallback: 'Select type',
                      }
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={QuestionType.MULTIPLE_CHOICE}>
                    {t('instructor.quiz.question.type.multipleChoice', {
                      fallback: 'Multiple Choice',
                    })}
                  </SelectItem>
                  <SelectItem value={QuestionType.TRUE_FALSE}>
                    {t('instructor.quiz.question.type.trueFalse', {
                      fallback: 'True/False',
                    })}
                  </SelectItem>
                  <SelectItem value={QuestionType.SHORT_ANSWER}>
                    {t('instructor.quiz.question.type.shortAnswer', {
                      fallback: 'Short Answer',
                    })}
                  </SelectItem>
                  <SelectItem value={QuestionType.FILL_IN_BLANK}>
                    {t('instructor.quiz.question.type.fillInBlank', {
                      fallback: 'Fill in the blank',
                    })}
                  </SelectItem>
                  <SelectItem value={QuestionType.ESSAY}>
                    {t('instructor.quiz.question.type.essay', {
                      fallback: 'Essay',
                    })}
                  </SelectItem>
                  <SelectItem value={QuestionType.MATCHING}>
                    {t('instructor.quiz.question.type.matching', {
                      fallback: 'Matching',
                    })}
                  </SelectItem>
                  <SelectItem value={QuestionType.RANKING}>
                    {t('instructor.quiz.question.type.ranking', {
                      fallback: 'Ranking',
                    })}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedType === QuestionType.MULTIPLE_CHOICE && (
              <MultipleChoiceQuestionForm
                quizId={quiz.id}
                isSubmitting={createQuestion.isPending}
                onCancel={() => setOpenCreate(false)}
                onSubmit={handleCreate}
              />
            )}
            {selectedType === QuestionType.TRUE_FALSE && (
              <TrueFalseQuestionForm
                quizId={quiz.id}
                isSubmitting={createQuestion.isPending}
                onCancel={() => setOpenCreate(false)}
                onSubmit={handleCreate}
              />
            )}
            {selectedType === QuestionType.SHORT_ANSWER && (
              <ShortAnswerQuestionForm
                quizId={quiz.id}
                isSubmitting={createQuestion.isPending}
                onCancel={() => setOpenCreate(false)}
                onSubmit={handleCreate}
              />
            )}
            {selectedType === QuestionType.FILL_IN_BLANK && (
              <FillInBlankQuestionForm
                quizId={quiz.id}
                isSubmitting={createQuestion.isPending}
                onCancel={() => setOpenCreate(false)}
                onSubmit={handleCreate}
              />
            )}
            {selectedType === QuestionType.ESSAY && (
              <EssayQuestionForm
                quizId={quiz.id}
                isSubmitting={createQuestion.isPending}
                onCancel={() => setOpenCreate(false)}
                onSubmit={handleCreate}
              />
            )}
            {selectedType === QuestionType.MATCHING && (
              <MatchingQuestionForm
                quizId={quiz.id}
                isSubmitting={createQuestion.isPending}
                onCancel={() => setOpenCreate(false)}
                onSubmit={handleCreate}
              />
            )}
            {selectedType === QuestionType.RANKING && (
              <RankingQuestionForm
                quizId={quiz.id}
                isSubmitting={createQuestion.isPending}
                onCancel={() => setOpenCreate(false)}
                onSubmit={handleCreate}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
