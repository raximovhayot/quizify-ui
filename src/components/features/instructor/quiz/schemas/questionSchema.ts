import { z } from 'zod';

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

// Helper to normalize payload for API
export function toInstructorQuestionSaveRequest(
  form: TInstructorQuestionForm
): InstructorQuestionSaveRequest {
  // Discriminate by type
  const type = form.questionType;

  const base = {
    quizId: form.quizId,
    questionType: form.questionType,
    content: form.content,
    explanation: form.explanation,
    order: form.order ?? 0,
    points: form.points ?? 0,
    attachmentId: form.attachmentId,
  } as InstructorQuestionSaveRequest;

  // Normalize answers order if present
  const mapAnswers = (
    answers?: TAnswerForm[]
  ): InstructionAnswerSaveRequest[] => {
    if (!answers || answers.length === 0) return [];
    return answers.map((a, idx) => ({
      id: a.id,
      content: a.content,
      correct: !!a.correct,
      order: idx,
      attachmentId: a.attachmentId,
    }));
  };

  switch (type) {
    case QuestionType.MULTIPLE_CHOICE: {
      const f = form as TMCQInput;
      return {
        ...base,
        answers: mapAnswers(f.answers),
      };
    }
    case QuestionType.TRUE_FALSE: {
      const f = form as TTFInput;
      return {
        ...base,
        trueFalseAnswer: f.trueFalseAnswer,
        answers: [],
      };
    }
    case QuestionType.SHORT_ANSWER: {
      const f = form as TSAInput;
      return {
        ...base,
        answers: mapAnswers(f.answers),
      };
    }
    case QuestionType.FILL_IN_BLANK: {
      const f = form as TFIBInput;
      return {
        ...base,
        blankTemplate: f.blankTemplate,
        answers: [],
      };
    }
    case QuestionType.ESSAY: {
      const f = form as TEssayInput;
      return {
        ...base,
        gradingCriteria: f.gradingCriteria,
        answers: [],
      };
    }
    case QuestionType.MATCHING: {
      const f = form as TMatchingInput;
      return {
        ...base,
        matchingConfig: JSON.stringify(f.matchingPairs),
        answers: [],
      };
    }
    case QuestionType.RANKING: {
      const f = form as TRankingInput;
      return {
        ...base,
        correctOrder: JSON.stringify(f.rankingItems),
        answers: [],
      };
    }
    default:
      return { ...base, answers: [] };
  }
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
  trueFalseAnswer: z.boolean().optional(),
  answers: z.array(answerDataDtoSchema),
});
