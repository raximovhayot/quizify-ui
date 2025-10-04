import { z } from 'zod';

import {
  AssignmentResultShowType,
  AssignmentResultType,
} from '../types/assignment';

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
  .refine((data) => new Date(data.settings.endTime) > new Date(data.settings.startTime), {
    message: 'End time must be after start time',
    path: ['settings', 'endTime'],
  });

export type TAssignmentCreateForm = z.infer<typeof assignmentCreateSchema>;
