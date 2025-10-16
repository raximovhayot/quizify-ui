import { z } from 'zod';

/**
 * Schema for grading an essay answer
 */
export const gradeEssaySchema = z.object({
  score: z
    .number()
    .min(0, 'Score must be at least 0')
    .max(100, 'Score cannot exceed 100'),
  feedback: z.string().optional(),
});

export type GradeEssayFormData = z.infer<typeof gradeEssaySchema>;
