'use client';

import { QuestionType } from '../../types/question';
import { QuestionForm, QuestionFormProps } from '../QuestionForm';

export type FillInBlankQuestionFormProps = Omit<QuestionFormProps, 'fixedType'>;

export function FillInBlankQuestionForm(props: FillInBlankQuestionFormProps) {
  return <QuestionForm {...props} fixedType={QuestionType.FILL_IN_BLANK} />;
}
