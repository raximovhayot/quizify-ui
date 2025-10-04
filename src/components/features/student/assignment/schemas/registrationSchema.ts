import { z } from 'zod';

export const registrationStatusSchema = z.enum([
  'ACTIVE',
  'COMPLETED',
  'CANCELLED',
]);

export const assignmentRegistrationSchema = z.object({
  id: z.number(),
  assignmentId: z.number(),
  studentId: z.number(),
  registeredAt: z.string(),
  status: registrationStatusSchema,
  assignment: z.object({
    id: z.number(),
    title: z.string(),
    description: z.string().optional(),
    startTime: z.string(),
    endTime: z.string(),
    maxAttempts: z.number(),
    timeLimit: z.number().optional(),
    quizId: z.number(),
  }),
  attemptsUsed: z.number(),
});

export const joinAssignmentRequestSchema = z.object({
  code: z.string().min(1, 'Code is required'),
});

export const joinAssignmentResponseSchema = z.object({
  assignmentId: z.number(),
  message: z.string(),
});

export const checkJoinRequestSchema = z.object({
  code: z.string().min(1, 'Code is required'),
});

export const checkJoinResponseSchema = z.object({
  assignmentId: z.number(),
  title: z.string(),
  description: z.string().optional(),
  startTime: z.string(),
  endTime: z.string(),
  isRegistered: z.boolean(),
  canJoin: z.boolean(),
  message: z.string().optional(),
});

export type TAssignmentRegistration = z.infer<
  typeof assignmentRegistrationSchema
>;
export type TJoinAssignmentRequest = z.infer<
  typeof joinAssignmentRequestSchema
>;
export type TJoinAssignmentResponse = z.infer<
  typeof joinAssignmentResponseSchema
>;
export type TCheckJoinRequest = z.infer<typeof checkJoinRequestSchema>;
export type TCheckJoinResponse = z.infer<typeof checkJoinResponseSchema>;
