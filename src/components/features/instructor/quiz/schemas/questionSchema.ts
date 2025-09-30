import { z } from 'zod';

import { buildQuestionSaveRequest } from '../components/factories/questionRequestRegistry';
import {
  InstructionAnswerSaveRequest,
  InstructorQuestionSaveRequest,
  QuestionType,
} from '../types/question';

// Shared answer schema used by MCQ and Short Answer forms
export const answerFormSchema = z.object({
  id: z.number().optional(),
  content: z.string().trim().min(1, 'Answer content is required'),
  correct: z.boolean().default(false),
  order: z.number().int().nonnegative().default(0),
  attachmentId: z.number().optional(),
});

export type TAnswerForm = z.input<typeof answerFormSchema>;

// Base fields common to all forms
const baseFormSchema = z.object({
  quizId: z.number().int().positive(),
  questionType: z.enum(QuestionType),
  content: z.string().trim().min(1, 'Question content is required'),
  explanation: z.string().trim().optional(),
  order: z.number().int().nonnegative().default(0),
  points: z.number().int().min(0, 'Points must be >= 0').default(0),
  attachmentId: z.number().optional(),
});

// Per-type form schemas
const mcqFormSchema = baseFormSchema.extend({
  questionType: z.literal(QuestionType.MULTIPLE_CHOICE),
  answers: z
    .array(answerFormSchema)
    .min(2, 'At least two answers are required')
    .refine((answers) => answers.some((a) => a.correct), {
      message: 'At least one correct answer is required',
    }),
});

const trueFalseFormSchema = baseFormSchema.extend({
  questionType: z.literal(QuestionType.TRUE_FALSE),
  trueFalseAnswer: z.boolean(),
  answers: z.array(answerFormSchema).max(0).default([]),
});

const shortAnswerFormSchema = baseFormSchema.extend({
  questionType: z.literal(QuestionType.SHORT_ANSWER),
  answers: z
    .array(answerFormSchema)
    .min(1, 'Provide at least one acceptable answer')
    .transform((answers) => answers.map((a) => ({ ...a, correct: true }))),
});

const fillInBlankFormSchema = baseFormSchema.extend({
  questionType: z.literal(QuestionType.FILL_IN_BLANK),
  blankTemplate: z.string().trim().min(1, 'Template is required'),
  answers: z.array(answerFormSchema).default([]),
});

const essayFormSchema = baseFormSchema.extend({
  questionType: z.literal(QuestionType.ESSAY),
  gradingCriteria: z.string().trim().min(1, 'Grading criteria is required'),
  answers: z.array(answerFormSchema).max(0).default([]),
});

// Matching and Ranking have UI-friendly fields which are transformed
const matchingFormSchema = baseFormSchema
  .extend({
    questionType: z.literal(QuestionType.MATCHING),
    matchingPairs: z
      .array(
        z.object({
          left: z.string().trim().min(1),
          right: z.string().trim().min(1),
        })
      )
      .min(1, 'Provide at least one pair'),
    answers: z.array(answerFormSchema).default([]),
  })
  .transform((data) => ({
    ...data,
    matchingConfig: JSON.stringify(data.matchingPairs),
  }));

const rankingFormSchema = baseFormSchema
  .extend({
    questionType: z.literal(QuestionType.RANKING),
    rankingItems: z
      .array(z.string().trim().min(1))
      .min(2, 'Provide at least two items'),
    answers: z.array(answerFormSchema).default([]),
  })
  .transform((data) => ({
    ...data,
    correctOrder: JSON.stringify(data.rankingItems),
  }));

export const instructorQuestionFormSchema = z.discriminatedUnion(
  'questionType',
  [
    mcqFormSchema,
    trueFalseFormSchema,
    shortAnswerFormSchema,
    fillInBlankFormSchema,
    essayFormSchema,
    matchingFormSchema as unknown as typeof baseFormSchema, // after transform, keep compatible
    rankingFormSchema as unknown as typeof baseFormSchema, // after transform, keep compatible
  ]
);

export type TInstructorQuestionForm = z.input<
  typeof instructorQuestionFormSchema
>;

// Narrowed input types per variant for type-safe normalization
type TMCQInput = z.input<typeof mcqFormSchema>;
type TTFInput = z.input<typeof trueFalseFormSchema>;
type TSAInput = z.input<typeof shortAnswerFormSchema>;
type TFIBInput = z.input<typeof fillInBlankFormSchema>;
type TEssayInput = z.input<typeof essayFormSchema>;
type TMatchingInput = z.input<typeof matchingFormSchema> & {
  matchingPairs: { left: string; right: string }[];
};
type TRankingInput = z.input<typeof rankingFormSchema> & {
  rankingItems: string[];
};

// Helper to normalize payload for API (polymorphic dispatch via registry)
export function toInstructorQuestionSaveRequest(
  form: TInstructorQuestionForm
): InstructorQuestionSaveRequest {
  return buildQuestionSaveRequest(form);
}

// DTO schemas for runtime validation at service boundaries
export const answerDataDtoSchema = z.object({
  id: z.number().optional(),
  content: z.string(),
  correct: z.boolean(),
  order: z.number().int(),
  attachmentId: z.number().optional(),
});

export const questionDataDtoSchema = z.object({
  id: z.number(),
  questionType: z.enum(QuestionType),
  content: z.string(),
  explanation: z.string().optional(),
  order: z.number().int(),
  points: z.number().int(),
  // Optional fields per type for editing/prefill
  trueFalseAnswer: z.boolean().optional(),
  blankTemplate: z.string().optional(),
  gradingCriteria: z.string().optional(),
  matchingConfig: z.string().optional(),
  correctOrder: z.string().optional(),
  answers: z.array(answerDataDtoSchema),
});
