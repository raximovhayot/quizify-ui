import { z } from 'zod';

import { pageableSchema } from '@/components/shared/schemas/pageable.schema';

import { QuizStatus } from '../types/quiz';

// Normalize backend enum values (accept 'DRAFT'/'PUBLISHED' or lowercase) to our lowercase enum
const statusSchema = z.preprocess(
  (val) => (typeof val === 'string' ? val.toLowerCase() : val),
  z.enum(QuizStatus)
);

// Quiz Settings Schema
export const quizSettingsSchema = z.object({
  // Some backends may send numbers as strings or null; coerce and allow optional
  time: z.coerce.number().min(0, 'Time limit cannot be negative').optional(),
  attempt: z.coerce
    .number()
    .min(0, 'Attempt limit cannot be negative')
    .optional(),
  // Flags may be missing; default to false
  shuffleQuestions: z.boolean().optional().default(false),
  shuffleAnswers: z.boolean().optional().default(false),
});

// Quiz Data DTO Schema
export const quizDataDTOSchema = z.object({
  id: z.coerce.number(),
  title: z.string(),
  description: z.string().nullable().optional(),
  status: statusSchema,
  createdDate: z.string(),
  lastModifiedDate: z.string().optional(),
  numberOfQuestions: z.coerce.number(),
  settings: quizSettingsSchema,
  // Backend may return null for no attachment; normalize null -> undefined to keep type narrow
  attachmentId: z.preprocess(
    (val) => (val === null ? undefined : val),
    z.coerce.number().optional()
  ),
});

// Quiz Filter Schema
export const quizFilterSchema = z.object({
  page: z.coerce.number().min(0).optional().default(0),
  size: z.coerce.number().min(1).max(100).optional().default(10),
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
  attachmentId: z.coerce.number().optional(),
});

// Quiz Update Request Schema
export const instructorQuizUpdateRequestSchema = z.object({
  id: z.coerce.number().optional(),
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(512, 'Title must be less than 512 characters'),
  description: z
    .string()
    .max(1024, 'Description must be less than 1024 characters')
    .optional(),
  settings: quizSettingsSchema,
  attachmentId: z.coerce.number().optional(),
});

// Quiz Status Update Request Schema
export const instructorQuizUpdateStatusRequestSchema = z.object({
  id: z.coerce.number(),
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
    time: z.coerce.number().min(0, 'Time limit cannot be negative').optional(),
    attempt: z.coerce
      .number()
      .min(0, 'Attempt limit cannot be negative')
      .optional(),
    shuffleQuestions: z.boolean().optional(),
    shuffleAnswers: z.boolean().optional(),
  }),
  attachmentId: z.coerce.number().optional(),
});

// API Response Schemas
export const quizListResponseSchema = pageableSchema(quizDataDTOSchema).catch(
  // Be resilient: if paging totals come as strings or are missing, coerce and default
  (val) => {
    // Try manual coercion if schema failed due to minor type mismatches
    if (val && typeof val === 'object') {
      const obj = val as Record<string, unknown>;
      return {
        content: Array.isArray(obj.content) ? obj.content : [],
        totalElements: Number(obj.totalElements ?? 0),
        totalPages: Number(obj.totalPages ?? 0),
        size: Number(
          obj.size ?? (Array.isArray(obj.content) ? obj.content.length : 0)
        ),
        page: Number(obj.page ?? 0),
      };
    }
    return { content: [], totalElements: 0, totalPages: 0, size: 0, page: 0 };
  }
);

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
