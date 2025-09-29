'use client';

import { QuestionType } from '../../types/question';
import { QuestionForm, QuestionFormProps } from '../QuestionForm';

export type ShortAnswerQuestionFormProps = Omit<QuestionFormProps, 'fixedType'>;

export function ShortAnswerQuestionForm(props: ShortAnswerQuestionFormProps) {
  return <QuestionForm {...props} fixedType={QuestionType.SHORT_ANSWER} />;
}
