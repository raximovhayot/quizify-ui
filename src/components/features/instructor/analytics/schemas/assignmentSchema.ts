import { z } from 'zod';

import { pageableSchema } from '@/components/shared/schemas/pageable.schema';

import {
  AssignmentResultShowType,
  AssignmentResultType,
  AssignmentStatus,
} from '../types/assignment';

// -------------------------------
// UI/Form Schemas (creation)
// -------------------------------
export const assignmentSettingsSchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  attempt: z.number().int().min(0).default(0),
  time: z.number().int().min(0).default(0),
  shuffleQuestions: z.boolean().default(false),
  shuffleAnswers: z.boolean().default(false),
  resultShowType: z
    .nativeEnum(AssignmentResultShowType)
    .default(AssignmentResultShowType.AFTER_ASSIGNMENT),
  resultType: z
    .nativeEnum(AssignmentResultType)
    .default(AssignmentResultType.ONLY_CORRECT),
});

export const assignmentCreateSchema = z
  .object({
    quizId: z.number().int().positive(),
    title: z.string().trim().min(3).max(512),
    description: z.string().trim().max(1024).optional(),
    settings: assignmentSettingsSchema,
  })
  .refine(
    (data) =>
      new Date(data.settings.endTime) > new Date(data.settings.startTime),
    {
      message: 'End time must be after start time',
      path: ['settings', 'endTime'],
    }
  );

export type TAssignmentCreateForm = z.infer<typeof assignmentCreateSchema>;

// -------------------------------
// DTO Schemas (service boundaries)
// -------------------------------

// Normalize backend enum values (accept 'DRAFT'/'PUBLISHED' or lowercase)
export const assignmentStatusSchema = z.preprocess(
  (val) => (typeof val === 'string' ? val.toLowerCase() : val),
  z.nativeEnum(AssignmentStatus)
);

export const assignmentSettingsDTOSchema = z.object({
  startTime: z.string(), // ISO string
  endTime: z.string(),
  attempt: z.coerce.number().min(0).default(0),
  time: z.coerce.number().min(0).default(0),
  shuffleQuestions: z.boolean().default(false),
  shuffleAnswers: z.boolean().default(false),
  resultShowType: z.nativeEnum(AssignmentResultShowType),
  resultType: z.nativeEnum(AssignmentResultType),
});

export const assignmentDataDTOSchema = z.object({
  id: z.coerce.number(),
  title: z.string(),
  description: z.string().optional().nullable(),
  status: assignmentStatusSchema.optional(),
  createdDate: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  quizId: z.coerce.number().optional(),
  settings: assignmentSettingsDTOSchema.optional(),
});

export const assignmentListResponseSchema = pageableSchema(
  assignmentDataDTOSchema
);

export type TAssignmentListResponse = z.infer<
  typeof assignmentListResponseSchema
>;
