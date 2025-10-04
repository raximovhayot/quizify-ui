import { z } from 'zod';

// Student Attempt Schema
export const studentAttemptSchema = z.object({
  id: z.coerce.number(),
  studentId: z.coerce.number(),
  studentName: z.string(),
  studentEmail: z.string().email(),
  attemptNumber: z.coerce.number(),
  status: z.enum(['IN_PROGRESS', 'SUBMITTED', 'GRADED']),
  score: z.number().nullable(),
  maxScore: z.coerce.number(),
  percentage: z.number().nullable(),
  startedAt: z.string(),
  submittedAt: z.string().nullable(),
  timeSpent: z.number().nullable(),
  correctCount: z.coerce.number(),
  incorrectCount: z.coerce.number(),
  unansweredCount: z.coerce.number(),
});

// Assignment Analytics Schema
export const assignmentAnalyticsSchema = z.object({
  assignmentId: z.coerce.number(),
  assignmentTitle: z.string(),
  quizTitle: z.string(),
  totalRegistrations: z.coerce.number(),
  totalAttempts: z.coerce.number(),
  completedAttempts: z.coerce.number(),
  inProgressAttempts: z.coerce.number(),
  averageScore: z.number().nullable(),
  highestScore: z.number().nullable(),
  lowestScore: z.number().nullable(),
  averageTimeSpent: z.number().nullable(),
  attempts: z.array(studentAttemptSchema),
});

// Question Analytics Schema
export const questionAnalyticsSchema = z.object({
  questionId: z.coerce.number(),
  questionText: z.string(),
  questionType: z.string(),
  points: z.coerce.number(),
  totalAttempts: z.coerce.number(),
  correctCount: z.coerce.number(),
  incorrectCount: z.coerce.number(),
  partialCount: z.coerce.number(),
  unansweredCount: z.coerce.number(),
  averageScore: z.number(),
  correctPercentage: z.number(),
});

// Student Registration Schema
export const studentRegistrationSchema = z.object({
  id: z.coerce.number(),
  studentId: z.coerce.number(),
  studentName: z.string(),
  studentEmail: z.string().email(),
  registeredAt: z.string(),
  attemptCount: z.coerce.number(),
  bestScore: z.number().nullable(),
  lastAttemptAt: z.string().nullable(),
});

export type TAssignmentAnalytics = z.infer<typeof assignmentAnalyticsSchema>;
export type TQuestionAnalytics = z.infer<typeof questionAnalyticsSchema>;
export type TStudentRegistration = z.infer<typeof studentRegistrationSchema>;
