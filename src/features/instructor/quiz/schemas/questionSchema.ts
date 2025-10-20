import { z } from 'zod';
import { QuestionType } from '../types/question';
import type { InstructorQuestionSaveRequest } from '../types/question';
import { buildQuestionSaveRequest } from '../components/factories/questionRequestRegistry';

// =====================
// Simplified schemas for backend data validation
// =====================

export const answerDataDtoSchema = z.object({
  id: z.number(),
  content: z.string(),
  correct: z.boolean().nullable().optional(),
  order: z.number().int(),
  matchingKey: z.string().nullable().optional(),
  correctPosition: z.number().int().nullable().optional(),
});

export const questionDataDtoSchema = z.object({
  id: z.number(),
  questionType: z.nativeEnum(QuestionType),
  content: z.string(),
  explanation: z.string().nullable().optional(),
  order: z.number().int(),
  points: z.number().int().min(0),
  answers: z.array(answerDataDtoSchema).default([]),
  // Optional fields for specific question types (per backend)
  trueFalseAnswer: z.boolean().nullable().optional(),
  gradingCriteria: z.string().nullable().optional(),
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

export const instructorQuestionFormSchema = baseQuestionFields.extend({
  questionType: z.literal(QuestionType.MULTIPLE_CHOICE),
  answers: z.array(formAnswerSchema).min(2, 'At least 2 answers required'),
});

export type TInstructorQuestionForm = z.infer<typeof instructorQuestionFormSchema>;

// Transform form data to API request
export function toInstructorQuestionSaveRequest(
  form: TInstructorQuestionForm
): InstructorQuestionSaveRequest {
  return buildQuestionSaveRequest(form);
}
