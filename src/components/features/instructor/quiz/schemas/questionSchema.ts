import { z } from 'zod';
import { QuestionType } from '../types/question';

// Basic DTO schemas
export const answerDataDtoSchema = z.object({
  id: z.number().optional(),
  content: z.string().min(1),
  correct: z.boolean(),
  order: z.number().int().nonnegative(),
  attachmentId: z.number().optional(),
});

export const questionDataDtoSchema = z.object({
  id: z.number(),
  questionType: z.nativeEnum(QuestionType),
  content: z.string(),
  explanation: z.string().optional(),
  order: z.number().int(),
  points: z.number().int().min(0),
  gradingCriteria: z.string().optional(),
  trueFalseAnswer: z.boolean().optional(),
  // The backend response DTO we saw did not include these, but frontend type includes for edit prefill.
  blankTemplate: z.string().optional(),
  matchingConfig: z.string().optional(),
  correctOrder: z.string().optional(),
  answers: z.array(answerDataDtoSchema).optional().default([]),
});

export type TQuestionDataDto = z.infer<typeof questionDataDtoSchema>;

// Request schemas
const baseQuestionSave = z.object({
  id: z.number().optional(),
  questionType: z.nativeEnum(QuestionType),
  content: z.string().min(1),
  explanation: z.string().optional(),
  attachmentId: z.number().optional(),
  quizId: z.number(),
  order: z.number().int().nonnegative(),
  points: z.number().int().min(0),
});

// Base answer (no type-specific fields)
const baseAnswerSave = z.object({
  id: z.number().optional(),
  content: z.string().min(1),
  order: z.number().int().nonnegative(),
  attachmentId: z.number().optional(),
});

// Standard answers (MCQ/Short/Fill) include a required `correct` flag
const standardAnswerSaveSchema = baseAnswerSave.extend({
  correct: z.boolean(),
});

// Matching answers require `matchingKey`; `correct` is not used
const matchingAnswerSaveSchema = baseAnswerSave.extend({
  matchingKey: z.string().min(1),
  // allow optional `correct` if present in UI; backend ignores it
  correct: z.boolean().optional(),
});

// Ranking answers do not use `correct`; order defines the item sequence
const rankingAnswerSaveSchema = baseAnswerSave.extend({
  // explicitly do not require `correct`
  correct: z.boolean().optional(),
});

const multipleChoiceSave = baseQuestionSave.extend({
  questionType: z.literal(QuestionType.MULTIPLE_CHOICE),
  answers: z
    .array(standardAnswerSaveSchema)
    .min(2)
    .refine((arr) => arr.some((a) => a.correct), {
      message: 'At least one answer must be marked correct',
    }),
});

const trueFalseSave = baseQuestionSave.extend({
  questionType: z.literal(QuestionType.TRUE_FALSE),
  trueFalseAnswer: z.boolean(),
  answers: z.array(standardAnswerSaveSchema).max(0).optional(),
});

const shortAnswerSave = baseQuestionSave.extend({
  questionType: z.literal(QuestionType.SHORT_ANSWER),
  answers: z.array(standardAnswerSaveSchema).min(1),
});

const essaySave = baseQuestionSave.extend({
  questionType: z.literal(QuestionType.ESSAY),
  gradingCriteria: z.string().min(1),
  answers: z.array(standardAnswerSaveSchema).max(0).optional(),
});

const fillInBlankSave = baseQuestionSave.extend({
  questionType: z.literal(QuestionType.FILL_IN_BLANK),
  blankTemplate: z.string().min(1),
  answers: z.array(standardAnswerSaveSchema).min(1),
});

const matchingSave = baseQuestionSave.extend({
  questionType: z.literal(QuestionType.MATCHING),
  matchingConfig: z.string().min(1),
  answers: z.array(matchingAnswerSaveSchema).min(4),
});

const rankingSave = baseQuestionSave.extend({
  questionType: z.literal(QuestionType.RANKING),
  correctOrder: z.string().min(1),
  answers: z.array(rankingAnswerSaveSchema).min(2),
});

export const instructorQuestionSaveSchema = z.discriminatedUnion('questionType', [
  multipleChoiceSave,
  trueFalseSave,
  shortAnswerSave,
  essaySave,
  fillInBlankSave,
  matchingSave,
  rankingSave,
]);

export type TInstructorQuestionSave = z.infer<typeof instructorQuestionSaveSchema>;

// Pageable schema helper
export const pageableSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    content: z.array(item),
    page: z.number().int().nonnegative(),
    size: z.number().int().positive(),
    totalElements: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    first: z.boolean().optional(),
    last: z.boolean().optional(),
  });

export const questionListSchema = pageableSchema(questionDataDtoSchema);
