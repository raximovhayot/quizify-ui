'use client';

import { QuestionType } from '../../types/question';
import { QuestionForm, QuestionFormProps } from '../QuestionForm';

export type MatchingQuestionFormProps = Omit<QuestionFormProps, 'fixedType'>;

export function MatchingQuestionForm(props: MatchingQuestionFormProps) {
  return <QuestionForm {...props} fixedType={QuestionType.MATCHING} />;
}
