'use client';

import { XIcon } from 'lucide-react';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import {
  Dialog,
  DialogClose,
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
import {
  QuestionFormRenderer,
  getAllQuestionTypes,
  getQuestionTypeLabel,
} from './factories/questionFormRegistry';

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
    try {
      const payload = toInstructorQuestionSaveRequest(formData);
      await createQuestion.mutateAsync(payload);
      setOpenCreate(false);
    } catch (e) {
      // Error toast is handled by mutation-utils; keep the dialog open on failure
      // Optionally log for dev
      console.error(e);
    }
  };

  return (
    <>
      <QuestionsList
        quizId={quiz.id}
        onAddQuestion={() => setOpenCreate(true)}
      />

      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent
          className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto"
          showCloseButton={false}
        >
          <DialogClose
            type="button"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogClose>
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
                  {getAllQuestionTypes().map((type) => (
                    <SelectItem key={type} value={type}>
                      {getQuestionTypeLabel(t, type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <QuestionFormRenderer
              type={selectedType}
              quizId={quiz.id}
              isSubmitting={createQuestion.isPending}
              onCancel={() => setOpenCreate(false)}
              onSubmit={handleCreate}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
