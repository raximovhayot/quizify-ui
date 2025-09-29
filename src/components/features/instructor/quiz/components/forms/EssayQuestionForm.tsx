'use client';

import { QuestionType } from '../../types/question';
import { QuestionForm, QuestionFormProps } from '../QuestionForm';

export type EssayQuestionFormProps = Omit<QuestionFormProps, 'fixedType'>;

export function EssayQuestionForm(props: EssayQuestionFormProps) {
  return <QuestionForm {...props} fixedType={QuestionType.ESSAY} />;
}
