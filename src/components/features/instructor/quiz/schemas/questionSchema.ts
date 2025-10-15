import { z } from 'zod';
import { QuestionType } from '../types/question';
import type { InstructorQuestionSaveRequest } from '../types/question';
import { buildQuestionSaveRequest } from '../components/factories/questionRequestRegistry';

// =====================
// Simplified schemas for backend data validation
// =====================

export const answerDataDtoSchema = z.object({
  id: z.number().optional(),
  content: z.string(),
  correct: z.boolean().default(false),
  order: z.number().int(),
  attachmentId: z.number().optional(),
  matchingKey: z.string().optional(),
});

export const questionDataDtoSchema = z.object({
  id: z.number(),
  questionType: z.nativeEnum(QuestionType),
  content: z.string(),
  explanation: z.string().optional(),
  order: z.number().int(),
  points: z.number().int().min(0),
  answers: z.array(answerDataDtoSchema).default([]),
  // Optional fields for specific question types
  trueFalseAnswer: z.boolean().optional(),
  blankTemplate: z.string().optional(),
  gradingCriteria: z.string().optional(),
  matchingConfig: z.string().optional(),
  correctOrder: z.string().optional(),
});

// =====================
// Form schemas for UI
// =====================

const formAnswerSchema = z.object({
  id: z.number().optional(),
  content: z.string().min(1, 'Answer content is required'),
  correct: z.boolean(),
  attachmentId: z.number().optional(),
});

const baseQuestionFields = z.object({
  quizId: z.number(),
  content: z.string().min(1, 'Question content is required'),
  explanation: z.string().optional(),
  points: z.number().int().min(0, 'Points must be non-negative'),
  order: z.number().int().nonnegative(),
});

export const instructorQuestionFormSchema = z.discriminatedUnion('questionType', [
  // Multiple choice
  baseQuestionFields.extend({
    questionType: z.literal(QuestionType.MULTIPLE_CHOICE),
    answers: z.array(formAnswerSchema).min(2, 'At least 2 answers required'),
  }),

  // True/False
  baseQuestionFields.extend({
    questionType: z.literal(QuestionType.TRUE_FALSE),
    trueFalseAnswer: z.boolean(),
  }),

  // Short answer
  baseQuestionFields.extend({
    questionType: z.literal(QuestionType.SHORT_ANSWER),
    answers: z.array(formAnswerSchema).min(1, 'At least 1 answer required'),
  }),

  // Essay
  baseQuestionFields.extend({
    questionType: z.literal(QuestionType.ESSAY),
    gradingCriteria: z.string().min(1, 'Grading criteria required'),
  }),

  // Fill in blank
  baseQuestionFields.extend({
    questionType: z.literal(QuestionType.FILL_IN_BLANK),
    blankTemplate: z.string().min(1, 'Blank template required'),
    answers: z.array(formAnswerSchema).min(1, 'At least 1 answer required'),
  }),

  // Matching
  baseQuestionFields.extend({
    questionType: z.literal(QuestionType.MATCHING),
    matchingPairs: z
      .array(z.object({ left: z.string().min(1), right: z.string().min(1) }))
      .min(2, 'At least 2 pairs required'),
    matchingConfig: z.string().optional(),
  }),

  // Ranking
  baseQuestionFields.extend({
    questionType: z.literal(QuestionType.RANKING),
    rankingItems: z.array(z.string().min(1)).min(2, 'At least 2 items required'),
    correctOrder: z.string().optional(),
  }),
]);

export type TInstructorQuestionForm = z.infer<typeof instructorQuestionFormSchema>;

// Transform form data to API request
export function toInstructorQuestionSaveRequest(
  form: TInstructorQuestionForm
): InstructorQuestionSaveRequest {
  return buildQuestionSaveRequest(form);
}
