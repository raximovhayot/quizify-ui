import { z } from 'zod';

import { AttemptStatus } from '@/components/features/student/quiz/types/attempt';

// Student Attempt DTO schema for runtime validation
export const studentAttemptDTOSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  attempt: z.number().int().nonnegative(),
  status: z.union([z.nativeEnum(AttemptStatus), z.string()]),
  correct: z.number().int().nonnegative(),
  incorrect: z.number().int().nonnegative(),
  notChosen: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
  // Backend may send nulls for optional fields; accept null and undefined
  quizTitle: z.string().nullable().optional(),
  quizId: z.number().int().positive().nullable().optional(),
  startedAt: z.string().nullable().optional(),
  finishedAt: z.string().nullable().optional(),
  score: z.number().nullable().optional(),
});

export type TStudentAttemptDTO = z.infer<typeof studentAttemptDTOSchema>;

// Generic pageable schema factory
export const pageableListSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    content: z.array(itemSchema),
    totalElements: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    size: z.number().int().nonnegative(),
    page: z.number().int().nonnegative(),
  });

export const studentAttemptPageSchema = pageableListSchema(
  studentAttemptDTOSchema
);
