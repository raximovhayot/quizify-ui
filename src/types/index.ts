/**
 * Central export file for all type definitions
 * This file provides a single entry point for importing types throughout the application
 */

// Common types
export * from './common';

// API types
export * from './api';

// Authentication types
export * from './auth';

// Assignment types
export * from './assignments';

// Quiz types
export * from './quizzes';

// Profile types
export * from './profile';

// Analytics types
export * from './analytics';

// Student types
export * from './student';

// Re-export commonly used types for convenience
export type {
  // Authentication
  User,
  UserRole,
  UserState,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  AuthContextType,
} from './auth';

export type {
  // API responses
  ApiResponse,
  ApiError,
} from './api';

export type {
  // Common
  Language,
} from './common';

export type {
  // Assignments
  Assignment,
  AssignmentStatus,
  AssignmentListResponse,
  JoinAssignmentRequest,
  JoinAssignmentResponse,
} from './assignments';

export type {
  // Quizzes
  Quiz,
  QuizQuestion,
  QuizAttempt,
  QuizStatus,
  QuestionType,
  QuizListResponse,
  StartQuizAttemptRequest,
  StartQuizAttemptResponse,
  SubmitQuizAttemptRequest,
  SubmitQuizAttemptResponse,
} from './quizzes';

export type {
  // Student views
  StudentAssignmentView,
  StudentDashboard,
  StudentProgress,
  StudentNotification,
} from './student';

export type {
  // Analytics
  InstructorAnalytics,
  StudentAnalytics,
  AnalyticsPeriod,
  AnalyticsRequest,
  AnalyticsResponse,
} from './analytics';