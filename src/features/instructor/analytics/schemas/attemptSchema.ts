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
 * Schema for pageable list of attempt summaries
 */
export const attemptSummaryListResponseSchema = pageableSchema(
  instructorAttemptSummarySchema
);

export type TInstructorAttemptSummary = z.infer<
  typeof instructorAttemptSummarySchema
>;
export type TAttemptSummaryListResponse = z.infer<
  typeof attemptSummaryListResponseSchema
>;
