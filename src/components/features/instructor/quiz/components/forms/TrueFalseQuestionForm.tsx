'use client';

import { QuestionType } from '../../types/question';
import { QuestionForm, QuestionFormProps } from '../QuestionForm';

export type TrueFalseQuestionFormProps = Omit<QuestionFormProps, 'fixedType'>;

export function TrueFalseQuestionForm(props: TrueFalseQuestionFormProps) {
  return <QuestionForm {...props} fixedType={QuestionType.TRUE_FALSE} />;
}
