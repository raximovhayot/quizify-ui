import { z } from 'zod';
import { QuestionType } from '../types/question';
import type { InstructorQuestionSaveRequest } from '../types/question';
import { buildQuestionSaveRequest } from '../components/factories/questionRequestRegistry';
import { pageableSchema } from '@/components/shared/schemas/pageable.schema';

// Helpers to normalize nullable and boolean-like fields from backend safely
const nullToUndefined = <T,>() =>
  z.preprocess((val) => (val === null ? undefined : val), z.any()) as unknown as z.ZodType<T>;

const booleanLike = z.preprocess((val) => {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val !== 0;
  if (typeof val === 'string') {
    const v = val.trim().toLowerCase();
    if (v === 'true' || v === '1') return true;
    if (v === 'false' || v === '0') return false;
  }
  return val;
}, z.boolean());

// Basic DTO schemas (tolerant to common backend variations)
export const answerDataDtoSchema = z.object({
  id: z.coerce.number().optional(),
  content: z.string().min(1),
  // Some backend variants (matching/ranking) may omit `correct` in AnswerDataDto
  correct: booleanLike.optional().default(false),
  // Some backends omit order or send null; parse to a sentinel and normalize later
  order: z
    .coerce
    .number()
    .int()
    .nullish()
    .transform((v) => (typeof v === 'number' && v >= 0 ? v : -1)),
  attachmentId: z.coerce.number().optional().nullable().transform((v) => (v == null ? undefined : v)),
});

export const questionDataDtoSchema = z.object({
  id: z.coerce.number(),
  questionType: z.preprocess(
    (val) => (typeof val === 'string' ? val.toLowerCase() : val),
    z.nativeEnum(QuestionType)
  ),
  content: z.string(),
  explanation: z.preprocess((v) => (v == null ? undefined : v), z.string().optional()),
  order: z.coerce.number().int(),
  points: z.coerce.number().int().min(0),
  gradingCriteria: z.preprocess((v) => (v == null ? undefined : v), z.string().optional()),
  trueFalseAnswer: booleanLike.optional(),
  // The backend response DTO we saw did not include these, but frontend type includes for edit prefill.
  blankTemplate: z.preprocess((v) => (v == null ? undefined : v), z.string().optional()),
  matchingConfig: z.preprocess((v) => (v == null ? undefined : v), z.string().optional()),
  correctOrder: z.preprocess((v) => (v == null ? undefined : v), z.string().optional()),
  answers: z
    .array(answerDataDtoSchema)
    .nullish()
    .transform((v) => v ?? []),
});

export type TQuestionDataDto = z.infer<typeof questionDataDtoSchema>;

export const questionListSchema = pageableSchema(questionDataDtoSchema);

// =====================
// Form schema (UI layer)
// =====================
// Reusable answer schema for form-level questions (MCQ, Short Answer, Fill in Blank)
const formStandardAnswerSchema = z.object({
  id: z.number().optional(),
  content: z.string().min(1),
  correct: z.boolean(),
  attachmentId: z.number().optional(),
});

// Base question fields reused by all form variants
const baseFormQuestionFields = z.object({
  quizId: z.number(),
  content: z.string().min(1),
  explanation: z.string().optional(),
  points: z.number().int().min(0),
  order: z.number().int().nonnegative(),
});

export const instructorQuestionFormSchema = z.discriminatedUnion('questionType', [
  // Multiple choice
  baseFormQuestionFields.extend({
    questionType: z.literal(QuestionType.MULTIPLE_CHOICE),
    answers: z.array(formStandardAnswerSchema).min(2),
  }),
  // True/False
  baseFormQuestionFields.extend({
    questionType: z.literal(QuestionType.TRUE_FALSE),
    trueFalseAnswer: z.boolean(),
  }),
  // Short answer
  baseFormQuestionFields.extend({
    questionType: z.literal(QuestionType.SHORT_ANSWER),
    answers: z.array(formStandardAnswerSchema).min(1),
  }),
  // Essay
  baseFormQuestionFields.extend({
    questionType: z.literal(QuestionType.ESSAY),
    gradingCriteria: z.string().min(1),
  }),
  // Fill in blank
  baseFormQuestionFields.extend({
    questionType: z.literal(QuestionType.FILL_IN_BLANK),
    blankTemplate: z.string().min(1),
    answers: z.array(formStandardAnswerSchema).min(1),
  }),
  // Matching
  baseFormQuestionFields.extend({
    questionType: z.literal(QuestionType.MATCHING),
    // Editable UI pairs; will be transformed into answers with matchingKey
    matchingPairs: z
      .array(z.object({ left: z.string().min(1), right: z.string().min(1) }))
      .min(2),
    // If present, we will prefer this JSON string
    matchingConfig: z.string().optional(),
  }),
  // Ranking
  baseFormQuestionFields.extend({
    questionType: z.literal(QuestionType.RANKING),
    // User-entered items; will be transformed into ordered answers
    rankingItems: z.array(z.string().min(1)).min(2),
    // If present, we prefer this JSON string
    correctOrder: z.string().optional(),
  }),
]);

export type TInstructorQuestionForm = z.infer<typeof instructorQuestionFormSchema>;

// ------------------------------------------------------------------
// Bridge helper: transform form → API request using the builders
// ------------------------------------------------------------------
export function toInstructorQuestionSaveRequest(
  form: TInstructorQuestionForm
): InstructorQuestionSaveRequest {
  return buildQuestionSaveRequest(form);
}
