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
 * Mirrors backend polymorphic request classes by providing per-QuestionType
 * strategies that transform a typed form (discriminated union) into a
 * normalized InstructorQuestionSaveRequest payload.
 *
 * Benefits:
 * - Eliminates big switch statements in transformers.
 * - Encapsulates per-type request specifics (fields, serialization) behind a
 *   stable interface.
 * - Matches our existing design-pattern approach (registries) and improves
 *   maintainability.
 */

export interface QuestionRequestBuilder {
  build(form: TInstructorQuestionForm): InstructorQuestionSaveRequest;
}

// Common mapper for answer arrays (MCQ and Short Answer)
function mapAnswers(
  answers?: ReadonlyArray<{
    id?: number;
    content: string;
    correct?: boolean;
    order?: number;
    attachmentId?: number;
  }>
): InstructionAnswerSaveRequest[] {
  if (!answers || answers.length === 0) return [];
  return answers.map((a, idx) => ({
    id: a.id,
    content: a.content,
    correct: !!a.correct,
    order: idx,
    attachmentId: a.attachmentId,
  }));
}

// Base fields shared by all types
function baseFields(
  form: TInstructorQuestionForm
): Pick<
  InstructorQuestionSaveRequest,
  | 'quizId'
  | 'questionType'
  | 'content'
  | 'explanation'
  | 'order'
  | 'points'
  | 'attachmentId'
> {
  return {
    quizId: form.quizId,
    questionType: form.questionType,
    content: form.content,
    explanation: form.explanation,
    order: form.order ?? 0,
    points: form.points ?? 0,
    attachmentId: (form as { attachmentId?: number }).attachmentId,
  };
}

// Type-specific builders
const mcqBuilder: QuestionRequestBuilder = {
  build(form) {
    const f = form as typeof form & {
      answers?: {
        id?: number;
        content: string;
        correct?: boolean;
        order?: number;
        attachmentId?: number;
      }[];
    };
    return {
      ...baseFields(form),
      answers: mapAnswers(f.answers),
    };
  },
};

const trueFalseBuilder: QuestionRequestBuilder = {
  build(form) {
    const f = form as typeof form & { trueFalseAnswer?: boolean };
    return {
      ...baseFields(form),
      trueFalseAnswer: !!f.trueFalseAnswer,
      answers: [],
    };
  },
};

const shortAnswerBuilder: QuestionRequestBuilder = {
  build(form) {
    const f = form as typeof form & {
      answers?: {
        id?: number;
        content: string;
        correct?: boolean;
        order?: number;
        attachmentId?: number;
      }[];
    };
    return {
      ...baseFields(form),
      answers: mapAnswers(f.answers),
    };
  },
};

const fillInBlankBuilder: QuestionRequestBuilder = {
  build(form) {
    const f = form as typeof form & {
      blankTemplate?: string;
      answers?: {
        id?: number;
        content: string;
        correct?: boolean;
        order?: number;
        attachmentId?: number;
      }[];
    };
    return {
      ...baseFields(form),
      blankTemplate: f.blankTemplate ?? '',
      answers: mapAnswers(f.answers),
    };
  },
};

const essayBuilder: QuestionRequestBuilder = {
  build(form) {
    const f = form as typeof form & { gradingCriteria?: string };
    return {
      ...baseFields(form),
      gradingCriteria: f.gradingCriteria ?? '',
      answers: [],
    };
  },
};

const matchingBuilder: QuestionRequestBuilder = {
  build(form) {
    // Support either pre-transformed matchingConfig or editable matchingPairs
    const f = form as typeof form & {
      matchingConfig?: string;
      matchingPairs?: { left: string; right: string }[];
    };

    // Build answers: for each pair, emit two answers with the same matchingKey
    const pairs = (f.matchingPairs ?? []).filter(
      (p) => p && p.left?.trim().length && p.right?.trim().length
    );

    const answers: InstructionAnswerSaveRequest[] = [];
    pairs.forEach((pair, idx) => {
      const matchingKey = `pair-${idx + 1}`; // stable readable key; can be swapped for UUIDs if needed
      answers.push(
        {
          content: pair.left,
          order: answers.length,
          matchingKey,
        },
        {
          content: pair.right,
          order: answers.length + 1,
          matchingKey,
        }
      );
    });

    const matchingConfig =
      typeof f.matchingConfig === 'string' && f.matchingConfig.length > 0
        ? f.matchingConfig
        : JSON.stringify(
            pairs.map((p, i) => ({ left: p.left, right: p.right, key: `pair-${i + 1}` }))
          );

    return {
      ...baseFields(form),
      matchingConfig,
      answers,
    };
  },
};

const rankingBuilder: QuestionRequestBuilder = {
  build(form) {
    // Support either pre-transformed correctOrder or editable rankingItems
    const f = form as typeof form & {
      correctOrder?: string;
      rankingItems?: string[];
    };

    const items = (f.rankingItems ?? []).filter((it) => it && it.trim().length);
    const answers: InstructionAnswerSaveRequest[] = items.map((content, idx) => ({
      content,
      order: idx,
    }));

    const correctOrder =
      typeof f.correctOrder === 'string' && f.correctOrder.length > 0
        ? f.correctOrder
        : JSON.stringify(items);

    return {
      ...baseFields(form),
      correctOrder,
      answers,
    };
  },
};

const builders: Record<QuestionType, QuestionRequestBuilder> = {
  [QuestionType.MULTIPLE_CHOICE]: mcqBuilder,
  [QuestionType.TRUE_FALSE]: trueFalseBuilder,
  [QuestionType.SHORT_ANSWER]: shortAnswerBuilder,
  [QuestionType.FILL_IN_BLANK]: fillInBlankBuilder,
  [QuestionType.ESSAY]: essayBuilder,
  [QuestionType.MATCHING]: matchingBuilder,
  [QuestionType.RANKING]: rankingBuilder,
};

export function getRequestBuilder(type: QuestionType): QuestionRequestBuilder {
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
