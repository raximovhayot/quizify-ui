'use client';

import type { TInstructorQuestionForm } from '../../schemas/questionSchema';
import {
  InstructionAnswerSaveRequest,
  InstructorQuestionSaveRequest,
  QuestionType,
} from '../../types/question';

/**
 * Question Request Strategy/Factory (Polymorphic Request Builders)
 *
 * Transforms a typed form (discriminated union) into an
 * `InstructorQuestionSaveRequest` payload.
 *
 * Design goals:
 * - No `any` and no ad‑hoc casts inside builders.
 * - Keep base field mapping small and consistent.
 * - Variant builders operate on their exact form shape.
 */

// Variant helpers for stronger typing
type TMCQ = Extract<TInstructorQuestionForm, { questionType: QuestionType.MULTIPLE_CHOICE }>;
type TTF = Extract<TInstructorQuestionForm, { questionType: QuestionType.TRUE_FALSE }>;
type TSA = Extract<TInstructorQuestionForm, { questionType: QuestionType.SHORT_ANSWER }>;
type TFIB = Extract<TInstructorQuestionForm, { questionType: QuestionType.FILL_IN_BLANK }>;
type TEssay = Extract<TInstructorQuestionForm, { questionType: QuestionType.ESSAY }>;
type TMatching = Extract<TInstructorQuestionForm, { questionType: QuestionType.MATCHING }>;
type TRanking = Extract<TInstructorQuestionForm, { questionType: QuestionType.RANKING }>;

export interface QuestionRequestBuilder<TForm extends TInstructorQuestionForm> {
  build(form: TForm): InstructorQuestionSaveRequest;
}

// Common mapper for answer arrays (MCQ, Short Answer, Fill in Blank, Ranking)
function mapAnswers(
  answers: ReadonlyArray<{
    id?: number;
    content: string;
    correct?: boolean;
    attachmentId?: number;
  }>
): InstructionAnswerSaveRequest[] {
  if (!answers || answers.length === 0) return [];
  return answers.map((a, idx) => ({
    id: a.id,
    content: a.content,
    correct: a.correct === true,
    order: idx,
  }));
}

// Base fields shared by all types (minimal, no attachmentId from form)
function baseFields(
  form: TInstructorQuestionForm
): Pick<
  InstructorQuestionSaveRequest,
  'quizId' | 'questionType' | 'content' | 'explanation' | 'order' | 'points'
> {
  return {
    quizId: form.quizId,
    questionType: form.questionType,
    content: form.content,
    explanation: form.explanation,
    order: form.order,
    points: form.points,
  };
}

// Type-specific builders (no casts needed inside)
const mcqBuilder: QuestionRequestBuilder<TMCQ> = {
  build(form) {
    return {
      ...baseFields(form),
      answers: mapAnswers(form.answers),
    };
  },
};

const trueFalseBuilder: QuestionRequestBuilder<TTF> = {
  build(form) {
    return {
      ...baseFields(form),
      trueFalseAnswer: form.trueFalseAnswer,
      answers: [],
    };
  },
};

const shortAnswerBuilder: QuestionRequestBuilder<TSA> = {
  build(form) {
    return {
      ...baseFields(form),
      answers: mapAnswers(form.answers),
    };
  },
};

const fillInBlankBuilder: QuestionRequestBuilder<TFIB> = {
  build(form) {
    return {
      ...baseFields(form),
      answers: mapAnswers(form.answers),
    };
  },
};

const essayBuilder: QuestionRequestBuilder<TEssay> = {
  build(form) {
    return {
      ...baseFields(form),
      gradingCriteria: form.gradingCriteria,
      answers: [],
    };
  },
};

const matchingBuilder: QuestionRequestBuilder<TMatching> = {
  build(form) {
    // Build answers: for each pair, emit two answers with the same matchingKey
    const pairs = (form.matchingPairs ?? []).filter(
      (p) => p && p.left?.trim().length && p.right?.trim().length
    );

    const answers: InstructionAnswerSaveRequest[] = [];
    pairs.forEach((pair, idx) => {
      const matchingKey = `pair-${idx + 1}`; // stable readable key; can be swapped for UUIDs if needed
      answers.push(
        { content: pair.left, order: answers.length, matchingKey },
        { content: pair.right, order: answers.length + 1, matchingKey }
      );
    });

    return {
      ...baseFields(form),
      answers,
    };
  },
};

const rankingBuilder: QuestionRequestBuilder<TRanking> = {
  build(form) {
    const items = (form.rankingItems ?? []).filter((it) => it && it.trim().length);
    const answers: InstructionAnswerSaveRequest[] = items.map((content, idx) => ({
      content,
      order: idx,
      correctPosition: idx,
    }));

    return {
      ...baseFields(form),
      answers,
    };
  },
};

// Registry
const builders: Record<QuestionType, QuestionRequestBuilder<TInstructorQuestionForm>> = {
  [QuestionType.MULTIPLE_CHOICE]: mcqBuilder as unknown as QuestionRequestBuilder<TInstructorQuestionForm>,
  [QuestionType.TRUE_FALSE]: trueFalseBuilder as unknown as QuestionRequestBuilder<TInstructorQuestionForm>,
  [QuestionType.SHORT_ANSWER]: shortAnswerBuilder as unknown as QuestionRequestBuilder<TInstructorQuestionForm>,
  [QuestionType.FILL_IN_BLANK]: fillInBlankBuilder as unknown as QuestionRequestBuilder<TInstructorQuestionForm>,
  [QuestionType.ESSAY]: essayBuilder as unknown as QuestionRequestBuilder<TInstructorQuestionForm>,
  [QuestionType.MATCHING]: matchingBuilder as unknown as QuestionRequestBuilder<TInstructorQuestionForm>,
  [QuestionType.RANKING]: rankingBuilder as unknown as QuestionRequestBuilder<TInstructorQuestionForm>,
};

export function getRequestBuilder(type: QuestionType): QuestionRequestBuilder<TInstructorQuestionForm> {
  return builders[type];
}

/**
 * High-level helper: polymorphic build based on questionType
 */
export function buildQuestionSaveRequest(
  form: TInstructorQuestionForm
): InstructorQuestionSaveRequest {
  const builder = getRequestBuilder(form.questionType);
  return builder.build(form);
}
