import { z } from 'zod';

import { pageableSchema } from '@/components/shared/schemas/pageable.schema';

/**
 * Schema for instructor attempt summary response from backend
 */
export const instructorAttemptSummarySchema = z.object({
  attemptId: z.coerce.number(),
  studentId: z.coerce.number(),
  studentName: z.string(),
  attemptNumber: z.coerce.number(),
  status: z.string(),
  startedAt: z.string(),
  completedAt: z.string().nullable(),
  durationSeconds: z.number().nullable(),
  score: z.number().nullable(),
  completed: z.boolean(),
});

/**
 * Schema for question result in attempt detail
 */
export const questionResultSchema = z.object({
  questionId: z.coerce.number(),
  questionType: z.string(),
  content: z.string(),
  correct: z.boolean().nullable(),
  pointsAwarded: z.number().nullable(),
  comment: z.string().nullable(),
});

/**
 * Schema for instructor attempt detail response from backend
 */
export const instructorAttemptDetailSchema = z.object({
  attemptId: z.coerce.number(),
  assignmentId: z.coerce.number(),
  quizId: z.coerce.number(),
  studentId: z.coerce.number(),
  studentName: z.string(),
  attemptNumber: z.coerce.number(),
  status: z.string(),
  startedAt: z.string(),
  completedAt: z.string().nullable(),
  durationSeconds: z.number().nullable(),
  score: z.number().nullable(),
  completed: z.boolean(),
  questions: z.array(questionResultSchema),
});

/**
 * Schema for pageable list of attempt summaries
 */
export const attemptSummaryListResponseSchema = pageableSchema(
  instructorAttemptSummarySchema
);

export type TInstructorAttemptSummary = z.infer<
  typeof instructorAttemptSummarySchema
>;
export type TInstructorAttemptDetail = z.infer<
  typeof instructorAttemptDetailSchema
>;
export type TQuestionResult = z.infer<typeof questionResultSchema>;
export type TAttemptSummaryListResponse = z.infer<
  typeof attemptSummaryListResponseSchema
>;
