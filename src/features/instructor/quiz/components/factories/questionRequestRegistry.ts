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
type TMCQ = TInstructorQuestionForm;

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

// Registry
const builders: Record<QuestionType, QuestionRequestBuilder<TInstructorQuestionForm>> = {
  [QuestionType.MULTIPLE_CHOICE]: mcqBuilder,
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
