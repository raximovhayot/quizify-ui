import { z } from 'zod';

import { pageableSchema } from '@/components/shared/schemas/pageable.schema';

import { QuizStatus } from '../types/quiz';

// Normalize backend enum values (accept 'DRAFT'/'PUBLISHED' or lowercase) to our lowercase enum
const statusSchema = z.preprocess(
  (val) => (typeof val === 'string' ? val.toLowerCase() : val),
  z.nativeEnum(QuizStatus)
);

const titleSchema = z
  .string()
  .min(3, 'Title must be at least 3 characters')
  .max(512, 'Title must be less than 512 characters');

const descriptionSchema = z
  .string()
  .max(1024, 'Description must be less than 1024 characters')
  .optional();

const attachmentIdSchema = z.coerce.number().optional();

// Quiz Settings Schema
export const quizSettingsSchema = z.object({
  time: z.coerce.number().min(0, 'Time limit cannot be negative').default(0),
  attempt: z.coerce
    .number()
    .min(0, 'Attempt limit cannot be negative')
    .default(0),
  shuffleQuestions: z.boolean().optional().default(false),
  shuffleAnswers: z.boolean().optional().default(false),
});

// Quiz Data DTO Schema
export const quizDataDTOSchema = z.object({
  id: z.coerce.number(),
  title: titleSchema,
  description: descriptionSchema,
  status: statusSchema,
  createdDate: z.string(),
  lastModifiedDate: z.string().optional(),
  numberOfQuestions: z.coerce.number(),
  settings: quizSettingsSchema,
  attachmentId: attachmentIdSchema,
});

export const quizFormSchema = z.object({
  title: titleSchema,
  description: descriptionSchema,
  settings: quizSettingsSchema,
  attachmentId: attachmentIdSchema,
});

export const quizListResponseSchema = pageableSchema(quizDataDTOSchema);

export type TQuizFormData = z.infer<typeof quizFormSchema>;
export type TQuizListResponse = z.infer<typeof quizListResponseSchema>;
