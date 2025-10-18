import { z } from 'zod';

import {
  AssignmentCreateRequest,
  AssignmentResultShowType,
  AssignmentResultType,
} from '../types/assignment';

export const assignmentStartUISchema = z
  .object({
    title: z.string().trim().min(3).max(512),
    description: z.string().trim().max(1024).optional(),
    startImmediately: z.boolean().default(false),
    startTimeLocal: z.string(),
    endTimeLocal: z.string(),
    attempt: z.coerce.number().int().min(0).default(0),
    time: z.coerce.number().int().min(0).default(0),
    shuffleQuestions: z.boolean().default(false),
    shuffleAnswers: z.boolean().default(false),
    resultShowType: z
      .nativeEnum(AssignmentResultShowType)
      .default(AssignmentResultShowType.AFTER_ASSIGNMENT),
    resultType: z
      .nativeEnum(AssignmentResultType)
      .default(AssignmentResultType.ONLY_CORRECT),
  })
  .refine(
    (data) => {
      const start = data.startImmediately ? new Date() : new Date(data.startTimeLocal);
      const end = new Date(data.endTimeLocal);
      return end > start;
    },
    {
      message: 'End time must be after start time',
      path: ['endTimeLocal'],
    }
  );

export type TAssignmentStartUIForm = z.infer<typeof assignmentStartUISchema>;

export function toAssignmentCreateRequest(
  quizId: number,
  values: TAssignmentStartUIForm
): AssignmentCreateRequest {
  const start = values.startImmediately
    ? new Date(Date.now() + 60 * 1000)
    : new Date(values.startTimeLocal);

  return {
    quizId,
    title: values.title,
    description: values.description,
    settings: {
      startTime: start.toISOString(),
      endTime: new Date(values.endTimeLocal).toISOString(),
      attempt: values.attempt ?? 0,
      time: values.time ?? 0,
      shuffleQuestions: values.shuffleQuestions,
      shuffleAnswers: values.shuffleAnswers,
      resultShowType: values.resultShowType,
      resultType: values.resultType,
    },
    startImmediately: values.startImmediately,
  };
}
