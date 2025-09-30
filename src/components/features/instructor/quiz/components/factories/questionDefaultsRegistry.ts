'use client';

import { TInstructorQuestionForm } from '../../schemas/questionSchema';
import {
  AnswerDataDto,
  QuestionDataDto,
  QuestionType,
} from '../../types/question';

/**
 * Question Defaults Strategy/Factory
 *
 * Why: Centralize per-QuestionType default value construction for react-hook-form
 * and align with the Strategy/Abstract Factory pattern used elsewhere (e.g., form registry).
 * This keeps BaseQuestionForm lean and removes switch/if chains from the component.
 *
 * Guarantees identical behavior to the previous implementation:
 * - Safe JSON parsing for MATCHING (matchingConfig) and RANKING (correctOrder)
 * - Stable shapes and sensible create-mode defaults per type
 * - Mapping of AnswerDataDto -> form answers for MCQ and Short Answer in edit mode
 */

// Narrowed answer form shape used by the form state
type TAnswerForm = Pick<AnswerDataDto, 'id' | 'content' | 'correct' | 'order'>;

// Helpers
const mapAnswers = (answers?: AnswerDataDto[]): TAnswerForm[] =>
  (answers ?? []).map((a) => ({
    id: a.id,
    content: a.content,
    correct: a.correct,
    order: a.order,
  }));

type TMatchingPair = { left: string; right: string };

const parseMatchingPairs = (matchingConfig?: string): TMatchingPair[] => {
  if (!matchingConfig) return [{ left: '', right: '' }];
  try {
    const parsed = JSON.parse(matchingConfig);
    if (Array.isArray(parsed)) {
      return parsed.map((p): TMatchingPair => {
        const obj: Record<string, unknown> =
          typeof p === 'object' && p !== null
            ? (p as Record<string, unknown>)
            : {};
        const leftVal = obj.left;
        const rightVal = obj.right;
        return {
          left: typeof leftVal === 'string' ? leftVal : String(leftVal ?? ''),
          right:
            typeof rightVal === 'string' ? rightVal : String(rightVal ?? ''),
        };
      });
    }
  } catch {
    // noop – fall through to default
  }
  return [{ left: '', right: '' }];
};

const parseRankingItems = (correctOrder?: string): string[] => {
  if (!correctOrder) return [];
  try {
    const parsed = JSON.parse(correctOrder);
    return Array.isArray(parsed)
      ? parsed.map((x) => (typeof x === 'string' ? x : String(x)))
      : [];
  } catch {
    return [];
  }
};

// Create-mode defaults per type
function createDefaults(
  type: QuestionType,
  quizId: number
): TInstructorQuestionForm {
  const base = {
    quizId,
    questionType: type,
    content: '',
    explanation: '',
    order: 0,
    points: 1,
  } as const;

  switch (type) {
    case QuestionType.MULTIPLE_CHOICE:
      return {
        ...base,
        answers: [
          { content: '', correct: true, order: 0 },
          { content: '', correct: false, order: 1 },
        ],
      } as unknown as TInstructorQuestionForm;
    case QuestionType.TRUE_FALSE:
      return {
        ...base,
        trueFalseAnswer: false,
        answers: [],
      } as unknown as TInstructorQuestionForm;
    case QuestionType.SHORT_ANSWER:
      return {
        ...base,
        answers: [{ content: '', correct: true, order: 0 }],
      } as unknown as TInstructorQuestionForm;
    case QuestionType.FILL_IN_BLANK:
      return {
        ...base,
        blankTemplate: '',
        answers: [],
      } as unknown as TInstructorQuestionForm;
    case QuestionType.ESSAY:
      return {
        ...base,
        gradingCriteria: '',
        answers: [],
      } as unknown as TInstructorQuestionForm;
    case QuestionType.MATCHING:
      return {
        ...base,
        matchingPairs: [{ left: '', right: '' }],
        answers: [],
      } as unknown as TInstructorQuestionForm;
    case QuestionType.RANKING:
      return {
        ...base,
        rankingItems: ['', ''],
        answers: [],
      } as unknown as TInstructorQuestionForm;
    default:
      return { ...base, answers: [] } as unknown as TInstructorQuestionForm;
  }
}

// Edit-mode defaults per type
function editDefaults(
  type: QuestionType,
  quizId: number,
  data: QuestionDataDto
): TInstructorQuestionForm {
  const base = {
    quizId,
    questionType: type,
    content: data.content,
    explanation: data.explanation || '',
    order: data.order,
    points: data.points,
  } as const;

  switch (type) {
    case QuestionType.MULTIPLE_CHOICE:
      return {
        ...base,
        answers: mapAnswers(data.answers),
      } as unknown as TInstructorQuestionForm;
    case QuestionType.SHORT_ANSWER:
      return {
        ...base,
        answers: mapAnswers(data.answers),
      } as unknown as TInstructorQuestionForm;
    case QuestionType.TRUE_FALSE:
      return {
        ...base,
        trueFalseAnswer: data.trueFalseAnswer ?? false,
        answers: [],
      } as unknown as TInstructorQuestionForm;
    case QuestionType.FILL_IN_BLANK:
      return {
        ...base,
        blankTemplate: data.blankTemplate ?? '',
        answers: [],
      } as unknown as TInstructorQuestionForm;
    case QuestionType.ESSAY:
      return {
        ...base,
        gradingCriteria: data.gradingCriteria ?? '',
        answers: [],
      } as unknown as TInstructorQuestionForm;
    case QuestionType.MATCHING:
      return {
        ...base,
        matchingPairs: parseMatchingPairs(data.matchingConfig),
        answers: [],
      } as unknown as TInstructorQuestionForm;
    case QuestionType.RANKING:
      return {
        ...base,
        rankingItems: parseRankingItems(data.correctOrder),
        answers: [],
      } as unknown as TInstructorQuestionForm;
    default:
      return { ...base, answers: [] } as unknown as TInstructorQuestionForm;
  }
}

export function buildCreateDefaultsFor(
  type: QuestionType,
  quizId: number
): TInstructorQuestionForm {
  return createDefaults(type, quizId);
}

export function buildEditDefaultsFor(
  type: QuestionType,
  quizId: number,
  data: QuestionDataDto
): TInstructorQuestionForm {
  return editDefaults(type, quizId, data);
}
