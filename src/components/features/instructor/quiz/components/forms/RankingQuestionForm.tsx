'use client';

import { QuestionType } from '../../types/question';
import { QuestionForm, QuestionFormProps } from '../QuestionForm';

export type RankingQuestionFormProps = Omit<QuestionFormProps, 'fixedType'>;

export function RankingQuestionForm(props: RankingQuestionFormProps) {
  return <QuestionForm {...props} fixedType={QuestionType.RANKING} />;
}
