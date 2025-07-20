/**
 * Assignment-related type definitions based on backend-filesystem MCP server
 */

import { AssignmentStatus, PageableList, SortDto } from './common';
import { BasicQuizDataDTO } from './quizzes';

// Assignment DTO based on backend
export interface AssignmentDataDto {
  id: number;
  title: string;
  description: string;
  quiz: BasicQuizDataDTO;
  code: string; // Unique join code for students
  attemptsAllowed: number;
  dueDate: string;
  status: AssignmentStatus;
  createdDate: string;
  updatedDate: string;
  totalStudents?: number; // Number of students who joined
  completedAttempts?: number; // Number of completed attempts
}

// Assignment request types based on backend
export interface InstructorAssignmentCreateRequest {
  title: string;
  description: string;
  quizId: number;
  attemptsAllowed: number;
  dueDate: string;
}

export interface InstructorAssignmentUpdateRequest {
  id: number;
  title?: string;
  description?: string;
  quizId?: number;
  attemptsAllowed?: number;
  dueDate?: string;
}

// Assignment filtering and pagination
export interface AssignmentFilter {
  page: number;
  size: number;
  search?: string;
  status?: AssignmentStatus;
  sorts: SortDto[];
}

// Student assignment types
export interface StudentAssignmentJoinRequest {
  code: string;
}

export interface AssignmentJoinResponse {
  assignment: AssignmentDataDto;
  message: string;
  alreadyJoined: boolean;
}

export interface AssignmentJoinCheckResponse {
  canJoin: boolean;
  assignment?: AssignmentDataDto;
  message: string;
}

// Student assignment registration types
export interface StudentAssignmentRegistration {
  id: number;
  assignmentId: number;
  studentId: number;
  joinedDate: string;
  attemptsUsed: number;
  lastAttemptDate?: string;
  status: 'active' | 'completed' | 'expired';
}

// Assignment question types (for instructor assignment questions)
export interface InstructorAssignmentQuestionRequest {
  assignmentId: number;
  questionId: number;
  points?: number;
  order?: number;
}

// Response types for assignment APIs
export type AssignmentListResponse = PageableList<AssignmentDataDto>;
export type AssignmentDetailsResponse = AssignmentDataDto;

// Student assignment attempt types
export interface StudentAssignmentAttempt {
  id: number;
  assignmentId: number;
  studentId: number;
  quizAttemptId: number;
  score: number;
  totalPoints: number;
  percentage: number;
  timeSpent: number; // in seconds
  startedAt: string;
  completedAt?: string;
  status: 'in_progress' | 'completed' | 'abandoned';
}

export interface StartAssignmentAttemptRequest {
  assignmentId: number;
}

export interface StartAssignmentAttemptResponse {
  attemptId: number;
  assignment: AssignmentDataDto;
  timeLimit?: number;
  startedAt: string;
  attemptsRemaining: number;
}

// Legacy types for backward compatibility
export type Assignment = AssignmentDataDto;
export type CreateAssignmentRequest = InstructorAssignmentCreateRequest;
export type UpdateAssignmentRequest = InstructorAssignmentUpdateRequest;
export type JoinAssignmentRequest = StudentAssignmentJoinRequest;
export type JoinAssignmentResponse = AssignmentJoinResponse;