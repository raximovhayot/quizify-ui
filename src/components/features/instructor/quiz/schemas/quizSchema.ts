import { z } from 'zod';

import { QuizStatus } from '../types/quiz';

// Quiz Settings Schema
export const quizSettingsSchema = z.object({
  time: z.number().min(0, 'Time limit cannot be negative').default(0),
  attempt: z.number().min(0, 'Attempt limit cannot be negative').default(0),
  shuffleQuestions: z.boolean().default(false),
  shuffleAnswers: z.boolean().default(false),
});

// Quiz Data DTO Schema
export const quizDataDTOSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable().optional(),
  status: z.nativeEnum(QuizStatus),
  createdDate: z.string(),
  lastModifiedDate: z.string().optional(),
  numberOfQuestions: z.number(),
  settings: z.preprocess((val) => (val == null ? {} : val), quizSettingsSchema),
  attachmentId: z.number().optional(),
});

// Quiz Filter Schema
export const quizFilterSchema = z.object({
  page: z.number().min(0).optional().default(0),
  size: z.number().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  status: z.nativeEnum(QuizStatus).optional(),
});

// Quiz Create Request Schema
export const instructorQuizCreateRequestSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(512, 'Title must be less than 512 characters'),
  description: z
    .string()
    .max(1024, 'Description must be less than 1024 characters')
    .optional(),
  settings: quizSettingsSchema,
  attachmentId: z.number().optional(),
});

// Quiz Update Request Schema
export const instructorQuizUpdateRequestSchema = z.object({
  id: z.number().optional(),
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(512, 'Title must be less than 512 characters'),
  description: z
    .string()
    .max(1024, 'Description must be less than 1024 characters')
    .optional(),
  settings: quizSettingsSchema,
  attachmentId: z.number().optional(),
});

// Quiz Status Update Request Schema
export const instructorQuizUpdateStatusRequestSchema = z.object({
  id: z.number(),
  status: z.nativeEnum(QuizStatus),
});

// Quiz Form Schema (for React Hook Form)
export const quizFormSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(512, 'Title must be less than 512 characters'),
  description: z
    .string()
    .max(1024, 'Description must be less than 1024 characters')
    .optional(),
  settings: z.object({
    time: z.number().min(0, 'Time limit cannot be negative').optional(),
    attempt: z.number().min(0, 'Attempt limit cannot be negative').optional(),
    shuffleQuestions: z.boolean().optional(),
    shuffleAnswers: z.boolean().optional(),
  }),
  attachmentId: z.number().optional(),
});

// API Response Schemas
export const quizListResponseSchema = z.object({
  content: z.array(quizDataDTOSchema).default([]),
  totalElements: z.number().default(0),
  totalPages: z.number().default(0),
  size: z.number().default(10),
  page: z.number().default(0),
});

// Type exports for use in components
export type TQuizSettings = z.infer<typeof quizSettingsSchema>;
export type TQuizDataDTO = z.infer<typeof quizDataDTOSchema>;
export type TQuizFilter = z.infer<typeof quizFilterSchema>;
export type TInstructorQuizCreateRequest = z.infer<
  typeof instructorQuizCreateRequestSchema
>;
export type TInstructorQuizUpdateRequest = z.infer<
  typeof instructorQuizUpdateRequestSchema
>;
export type TInstructorQuizUpdateStatusRequest = z.infer<
  typeof instructorQuizUpdateStatusRequestSchema
>;
export type TQuizFormData = z.infer<typeof quizFormSchema>;
export type TQuizListResponse = z.infer<typeof quizListResponseSchema>;
