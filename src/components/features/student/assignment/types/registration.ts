/**
 * Assignment registration status
 */
export enum RegistrationStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * Assignment registration data
 */
export interface AssignmentRegistration {
  id: number;
  assignmentId: number;
  studentId: number;
  registeredAt: string;
  status: RegistrationStatus;
  assignment: {
    id: number;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    maxAttempts: number;
    timeLimit?: number;
    quizId: number;
  };
  attemptsUsed: number;
}

/**
 * Join assignment request
 */
export interface JoinAssignmentRequest {
  code: string;
}

/**
 * Join assignment response
 */
export interface JoinAssignmentResponse {
  assignmentId: number;
  message: string;
}

/**
 * Check join request
 */
export interface CheckJoinRequest {
  code: string;
}

/**
 * Check join response
 */
export interface CheckJoinResponse {
  assignmentId: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  isRegistered: boolean;
  canJoin: boolean;
  message?: string;
}
