'use client';

import { QuestionType } from '../../types/question';
import { QuestionForm, QuestionFormProps } from '../QuestionForm';

export type MultipleChoiceQuestionFormProps = Omit<
  QuestionFormProps,
  'fixedType'
>;

export function MultipleChoiceQuestionForm(
  props: MultipleChoiceQuestionFormProps
) {
  return <QuestionForm {...props} fixedType={QuestionType.MULTIPLE_CHOICE} />;
}
