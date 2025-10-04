import { z } from 'zod';

/**
 * Student attempt for analytics
 */
export interface StudentAttempt {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  attemptNumber: number;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED';
  score: number | null;
  maxScore: number;
  percentage: number | null;
  startedAt: string;
  submittedAt: string | null;
  timeSpent: number | null; // in seconds
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
}

/**
 * Assignment analytics overview
 */
export interface AssignmentAnalytics {
  assignmentId: number;
  assignmentTitle: string;
  quizTitle: string;
  totalRegistrations: number;
  totalAttempts: number;
  completedAttempts: number;
  inProgressAttempts: number;
  averageScore: number | null;
  highestScore: number | null;
  lowestScore: number | null;
  averageTimeSpent: number | null; // in seconds
  attempts: StudentAttempt[];
}

/**
 * Question-level analytics
 */
export interface QuestionAnalytics {
  questionId: number;
  questionText: string;
  questionType: string;
  points: number;
  totalAttempts: number;
  correctCount: number;
  incorrectCount: number;
  partialCount: number;
  unansweredCount: number;
  averageScore: number;
  correctPercentage: number;
}

/**
 * Assignment analytics filter
 */
export interface AnalyticsFilter {
  status?: 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED';
  search?: string;
}

/**
 * Student registration info
 */
export interface StudentRegistration {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  registeredAt: string;
  attemptCount: number;
  bestScore: number | null;
  lastAttemptAt: string | null;
}
