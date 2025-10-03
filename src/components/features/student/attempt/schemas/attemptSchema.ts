import { z } from 'zod';

import { questionDataDtoSchema } from '@/components/features/instructor/quiz/schemas/questionSchema';

export const attemptStatusSchema = z.enum(['CREATED', 'STARTED', 'FINISHED']);

export const attemptDataSchema = z.object({
  id: z.number(),
  assignmentId: z.number(),
  studentId: z.number(),
  status: attemptStatusSchema,
  startedAt: z.string().optional(),
  finishedAt: z.string().optional(),
  score: z.number().optional(),
  totalQuestions: z.number(),
  answeredQuestions: z.number(),
  timeRemaining: z.number().optional(),
});

export const attemptQuestionSchema = questionDataDtoSchema.extend({
  attemptAnswerId: z.number().optional(),
  studentAnswer: z.unknown().optional(),
  isAnswered: z.boolean(),
  isFlagged: z.boolean().optional(),
});

export const submitAnswerRequestSchema = z.object({
  questionId: z.number(),
  answer: z.unknown(),
});

export const attemptResultSchema = z.object({
  id: z.number(),
  assignmentId: z.number(),
  score: z.number(),
  totalQuestions: z.number(),
  correctAnswers: z.number(),
  incorrectAnswers: z.number(),
  unansweredQuestions: z.number(),
  timeSpent: z.number(),
  finishedAt: z.string(),
  canViewAnswers: z.boolean(),
  canViewCorrectAnswers: z.boolean(),
});

export const questionResultSchema = z.object({
  questionId: z.number(),
  question: questionDataDtoSchema,
  studentAnswer: z.unknown().optional(),
  correctAnswer: z.unknown().optional(),
  isCorrect: z.boolean(),
  score: z.number(),
  maxScore: z.number(),
  feedback: z.string().optional(),
});

export type TAttemptData = z.infer<typeof attemptDataSchema>;
export type TAttemptQuestion = z.infer<typeof attemptQuestionSchema>;
export type TSubmitAnswerRequest = z.infer<typeof submitAnswerRequestSchema>;
export type TAttemptResult = z.infer<typeof attemptResultSchema>;
export type TQuestionResult = z.infer<typeof questionResultSchema>;
