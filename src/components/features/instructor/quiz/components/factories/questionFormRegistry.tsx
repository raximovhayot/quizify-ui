'use client';

import { ComponentType } from 'react';

import { QuestionType } from '../../types/question';
import type { BaseQuestionFormProps } from '../forms/BaseQuestionForm';
import { EssayQuestionForm } from '../forms/EssayQuestionForm';
import { FillInBlankQuestionForm } from '../forms/FillInBlankQuestionForm';
import { MatchingQuestionForm } from '../forms/MatchingQuestionForm';
import { MultipleChoiceQuestionForm } from '../forms/MultipleChoiceQuestionForm';
import { RankingQuestionForm } from '../forms/RankingQuestionForm';
import { ShortAnswerQuestionForm } from '../forms/ShortAnswerQuestionForm';
import { TrueFalseQuestionForm } from '../forms/TrueFalseQuestionForm';

// Common props all specific question forms share (each is BaseQuestionForm with fixedType enforced)
export type CommonQuestionFormProps = Omit<
  BaseQuestionFormProps,
  'fixedType' | 'children'
>;

export type QuestionFormComponent = ComponentType<CommonQuestionFormProps>;

// Strategy/Abstract Factory registry for mapping QuestionType to a concrete form component
const questionFormRegistry: Record<QuestionType, QuestionFormComponent> = {
  [QuestionType.MULTIPLE_CHOICE]: MultipleChoiceQuestionForm,
  [QuestionType.TRUE_FALSE]: TrueFalseQuestionForm,
  [QuestionType.SHORT_ANSWER]: ShortAnswerQuestionForm,
  [QuestionType.FILL_IN_BLANK]: FillInBlankQuestionForm,
  [QuestionType.ESSAY]: EssayQuestionForm,
  [QuestionType.MATCHING]: MatchingQuestionForm,
  [QuestionType.RANKING]: RankingQuestionForm,
};

export function getQuestionFormComponent(
  type: QuestionType
): QuestionFormComponent {
  return questionFormRegistry[type];
}

export interface QuestionFormRendererProps extends CommonQuestionFormProps {
  type: QuestionType;
}

// High-level renderer to avoid switch/if ladders where forms are used
export function QuestionFormRenderer({
  type,
  ...props
}: QuestionFormRendererProps) {
  const FormComponent = getQuestionFormComponent(type);
  return <FormComponent {...props} />;
}

// ---- Design-pattern registry extension: QuestionType metadata helpers ----

// Translate function shape we expect from next-intl useTranslations()
export type TranslateFn = (key: string, params: { fallback: string }) => string;

// Centralized i18n keys and fallbacks per QuestionType (shared under common)
const questionTypeLabelKeys: Record<
  QuestionType,
  { key: string; fallback: string }
> = {
  [QuestionType.MULTIPLE_CHOICE]: {
    key: 'common.questionTypes.multipleChoice',
    fallback: 'Multiple Choice',
  },
  [QuestionType.TRUE_FALSE]: {
    key: 'common.questionTypes.trueFalse',
    fallback: 'True/False',
  },
  [QuestionType.SHORT_ANSWER]: {
    key: 'common.questionTypes.shortAnswer',
    fallback: 'Short Answer',
  },
  [QuestionType.FILL_IN_BLANK]: {
    key: 'common.questionTypes.fillInBlank',
    fallback: 'Fill in Blank',
  },
  [QuestionType.ESSAY]: {
    key: 'common.questionTypes.essay',
    fallback: 'Essay',
  },
  [QuestionType.MATCHING]: {
    key: 'common.questionTypes.matching',
    fallback: 'Matching',
  },
  [QuestionType.RANKING]: {
    key: 'common.questionTypes.ranking',
    fallback: 'Ranking',
  },
};

// Canonical ordering for UI lists (Select, etc.)
export function getAllQuestionTypes(): QuestionType[] {
  return [
    QuestionType.MULTIPLE_CHOICE,
    QuestionType.TRUE_FALSE,
    QuestionType.SHORT_ANSWER,
    QuestionType.FILL_IN_BLANK,
    QuestionType.ESSAY,
    QuestionType.MATCHING,
    QuestionType.RANKING,
  ];
}

// Resolve localized label for a QuestionType via the registry
export function getQuestionTypeLabel(
  t: TranslateFn,
  type: QuestionType
): string {
  const meta = questionTypeLabelKeys[type];
  return t(meta.key, { fallback: meta.fallback });
}
