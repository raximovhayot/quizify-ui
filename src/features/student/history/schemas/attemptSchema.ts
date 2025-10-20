import { z } from 'zod';

import { AttemptStatus } from '@/features/student/quiz/types/attempt';
import { pageableSchema } from '@/components/shared/schemas/pageable.schema';
import {QuestionType} from "@/features/instructor/quiz/types";

export const attemptListDTOSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  attempt: z.number().int().nonnegative(),
  status: z.enum(AttemptStatus),
  correct: z.number().int().nonnegative().optional(),
  incorrect: z.number().int().nonnegative().optional(),
  notChosen: z.number().int().nonnegative().optional(),
  total: z.number().int().nonnegative().optional(),
});

export const pageableAttemptListSchema = pageableSchema(attemptListDTOSchema);


// ============================================================================
// Attempt Player Schemas (content, save-state, complete)
// Source: StudentAssignmentAttemptController (2025-10-07)
// - GET    /student/assignments/attempts/{attemptId}/content → AttemptFullData
// - POST   /student/assignments/attempts/save-state           → number (attemptId)
// - POST   /student/assignments/attempts/{attemptId}/complete → number (attemptId)
// We model minimal forward-compatible shapes and allow extra fields with .passthrough()
// ============================================================================

export const attemptAnswerOptionSchema = z
  .object({
    id: z.number().int().positive(),
    content: z.string().optional(),
    order: z.number().int().nonnegative().optional(),
    attachmentId: z.number().int().positive().optional(),
  })
  .passthrough();

export const attemptQuestionSchema = z
  .object({
    id: z.number().int().positive(),
    questionType: z.nativeEnum(QuestionType),
    content: z.string(),
    // For MCQ-like questions
    answers: z.array(attemptAnswerOptionSchema).optional().default([]),
    points: z.number().int().nonnegative().optional(),
    order: z.number().int().nonnegative().optional(),
  })
  .passthrough();

export const attemptFullDataSchema = z
  .object({
    attemptId: z.number().int().positive(),
    title: z.string(),
    status: z.nativeEnum(AttemptStatus).optional(),
    timeLimitSeconds: z.number().int().nonnegative().optional(),
    startedAt: z.string().optional(),
    assignmentId: z.number().int().positive().optional(),
    quizId: z.number().int().positive().optional(),
    questions: z.array(attemptQuestionSchema),
  })
  .passthrough();

export const saveStateAnswerSchema = z
  .object({
    questionId: z.number().int().positive(),
    // For selection questions (MCQ, matching via ids, etc.)
    answerIds: z.array(z.number().int().positive()).optional(),
    // For text-based questions
    textAnswer: z.string().optional(),
  })
  .refine((v) => v.answerIds !== undefined || v.textAnswer !== undefined, {
    message: 'Either answerIds or textAnswer must be provided',
    path: ['answerIds'],
  })
  .passthrough();

export const attemptSaveStateRequestSchema = z
  .object({
    attemptId: z.number().int().positive(),
    answers: z.array(saveStateAnswerSchema).min(1),
  })
  .passthrough();

export type AttemptFullData = z.infer<typeof attemptFullDataSchema>;
export type AttemptSaveStateRequest = z.infer<typeof attemptSaveStateRequestSchema>;
