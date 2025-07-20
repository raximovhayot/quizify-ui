/**
 * Analytics-related type definitions based on backend-filesystem MCP server
 */

import { PageableList } from './common';

export type AnalyticsPeriod = 'week' | 'month' | 'quarter' | 'year';

// Assignment analytics (aligned with backend structure)
export interface AssignmentAnalytics {
  assignmentId: number;
  assignmentTitle: string;
  totalStudents: number;
  completedAttempts: number;
  averageScore: number;
  passRate: number; // percentage of students who passed
  averageTimeSpent: number; // in seconds (backend format)
}

// Quiz analytics (aligned with backend structure)
export interface QuizAnalytics {
  quizId: number;
  quizTitle: string;
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  averageTimeSpent: number; // in seconds (backend format)
  questionAnalytics: QuestionAnalytics[];
}

// Question analytics (aligned with backend structure)
export interface QuestionAnalytics {
  questionId: number;
  question: string;
  correctAnswers: number;
  totalAnswers: number;
  accuracyRate: number; // percentage
  averageTimeSpent: number; // in seconds (backend format)
}

// Student performance analytics (aligned with backend structure)
export interface StudentPerformance {
  studentId: number;
  studentName: string;
  totalAssignments: number;
  completedAssignments: number;
  averageScore: number;
  totalTimeSpent: number; // in seconds (backend format)
  lastActivity: string;
}

// Instructor analytics dashboard (based on AttemptAnalyticsController)
export interface InstructorAnalytics {
  period: AnalyticsPeriod;
  totalQuizzes: number;
  totalAssignments: number;
  totalStudents: number;
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  mostPopularSubjects: SubjectAnalytics[];
  recentActivity: ActivitySummary[];
  assignmentAnalytics: AssignmentAnalytics[];
  studentPerformance: StudentPerformance[];
}

// Subject analytics
export interface SubjectAnalytics {
  subject: string;
  quizCount: number;
  assignmentCount: number;
  averageScore: number;
  totalAttempts: number;
}

// Activity summary
export interface ActivitySummary {
  date: string;
  quizzesCreated: number;
  assignmentsCreated: number;
  attemptsCompleted: number;
  newStudents: number;
}

// Analytics request types (based on backend patterns)
export interface AnalyticsRequest {
  period?: AnalyticsPeriod;
  assignmentId?: number;
  quizId?: number;
  subject?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

// Analytics response types
export interface AnalyticsResponse {
  analytics: InstructorAnalytics;
  generatedAt: string;
}

// Student analytics (aligned with backend structure)
export interface StudentAnalytics {
  studentId: number;
  totalAssignments: number;
  completedAssignments: number;
  pendingAssignments: number;
  averageScore: number;
  totalTimeSpent: number; // in seconds (backend format)
  recentAttempts: RecentAttempt[];
  subjectPerformance: StudentSubjectPerformance[];
}

// Recent attempt analytics
export interface RecentAttempt {
  attemptId: number;
  assignmentTitle: string;
  quizTitle: string;
  score: number;
  percentage: number;
  completedAt: string;
  timeSpent: number; // in seconds (backend format)
}

// Student subject performance
export interface StudentSubjectPerformance {
  subject: string;
  averageScore: number;
  totalAttempts: number;
  bestScore: number;
  improvementTrend: 'improving' | 'declining' | 'stable';
}

// Attempt analytics (based on AttemptAnalyticsController)
export interface AttemptAnalytics {
  attemptId: number;
  assignmentId: number;
  quizId: number;
  studentId: number;
  score: number;
  totalPoints: number;
  percentage: number;
  timeSpent: number; // in seconds
  startedAt: string;
  completedAt: string;
  questionAnalytics: AttemptQuestionAnalytics[];
}

export interface AttemptQuestionAnalytics {
  questionId: number;
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
  timeSpent: number; // in seconds
}

// Analytics filter types
export interface AnalyticsFilter {
  page: number;
  size: number;
  startDate?: string;
  endDate?: string;
  assignmentId?: number;
  quizId?: number;
  studentId?: number;
  subject?: string;
}

// Response types for analytics APIs
export type AnalyticsListResponse<T> = PageableList<T>;
export type AssignmentAnalyticsResponse = AnalyticsListResponse<AssignmentAnalytics>;
export type QuizAnalyticsResponse = AnalyticsListResponse<QuizAnalytics>;
export type StudentPerformanceResponse = AnalyticsListResponse<StudentPerformance>;
export type AttemptAnalyticsResponse = AnalyticsListResponse<AttemptAnalytics>;