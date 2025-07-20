/**
 * Student-specific type definitions based on backend-filesystem MCP server
 */

import { AssignmentDataDto, StudentAssignmentAttempt } from './assignments';
import { QuizAttempt } from './quizzes';
import { AccountDTO } from './auth';

// Student assignment view (enhanced with backend data)
export interface StudentAssignmentView {
  id: number;
  title: string;
  description: string;
  assignmentCode: string;
  dueDate: string;
  status: 'active' | 'expired' | 'draft';
  attemptsAllowed: number;
  attemptsUsed: number;
  attemptsRemaining: number;
  bestScore: number | null;
  instructor: {
    firstName: string;
    lastName: string;
  } | null;
  quiz: {
    id: number;
    title: string;
    questionsCount: number;
    timeLimit?: number;
  } | null;
  latestAttempt: {
    id: number;
    startTime: string;
    endTime: string | null;
    score: number | null;
    status: 'in_progress' | 'completed' | 'abandoned';
    timeElapsed: number | null;
  } | null;
  canStartNewAttempt: boolean;
  isExpired: boolean;
}

export interface StudentAssignmentsResponse {
  assignments: StudentAssignmentView[];
  total: number;
}

// Student dashboard data
export interface StudentDashboard {
  totalAssignments: number;
  completedAssignments: number;
  pendingAssignments: number;
  expiredAssignments: number;
  averageScore: number;
  recentAssignments: StudentAssignmentView[];
  upcomingDeadlines: UpcomingDeadline[];
  achievements: Achievement[];
}

export interface UpcomingDeadline {
  assignmentId: number;
  assignmentTitle: string;
  dueDate: string;
  daysRemaining: number;
  attemptsRemaining: number;
  isUrgent: boolean; // less than 24 hours remaining
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
  category: 'score' | 'completion' | 'streak' | 'improvement';
}

// Student quiz attempt summary (based on backend QuizAttempt)
export interface StudentQuizAttemptSummary {
  attemptId: number;
  assignmentId: number;
  assignmentTitle: string;
  quizTitle: string;
  score: number;
  totalPoints: number;
  percentage: number;
  timeSpent: number; // in seconds (backend format)
  completedAt: string;
  questionsCorrect: number;
  totalQuestions: number;
  passed: boolean;
  feedback?: string;
}

// Student progress tracking
export interface StudentProgress {
  subjectProgress: SubjectProgress[];
  overallProgress: {
    totalAssignments: number;
    completedAssignments: number;
    averageScore: number;
    improvementTrend: 'improving' | 'declining' | 'stable';
    streakDays: number;
    totalTimeSpent: number; // in seconds (backend format)
  };
  weeklyActivity: WeeklyActivity[];
}

export interface SubjectProgress {
  subject: string;
  totalAssignments: number;
  completedAssignments: number;
  averageScore: number;
  bestScore: number;
  improvementTrend: 'improving' | 'declining' | 'stable';
  lastActivity: string;
}

export interface WeeklyActivity {
  week: string; // ISO week string
  assignmentsCompleted: number;
  averageScore: number;
  timeSpent: number; // in seconds (backend format)
}

// Student notifications
export interface StudentNotification {
  id: number;
  type: 'assignment_due' | 'new_assignment' | 'grade_available' | 'achievement';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  actionUrl?: string;
  metadata?: {
    assignmentId?: number;
    achievementId?: number;
    score?: number;
  };
}

// Student assignment registration (from backend analysis)
export interface StudentAssignmentRegistration {
  id: number;
  assignmentId: number;
  studentId: number;
  joinedDate: string;
  attemptsUsed: number;
  lastAttemptDate?: string;
  status: 'active' | 'completed' | 'expired';
}

// Student quiz controller types (based on backend)
export interface StudentQuizListRequest {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
}

export interface StudentQuizAttemptRequest {
  quizId: number;
  assignmentId: number;
}

// Helper types for student views
export type StudentAssignmentWithDetails = AssignmentDataDto & {
  registration: StudentAssignmentRegistration;
  attempts: StudentAssignmentAttempt[];
  canJoin: boolean;
  canAttempt: boolean;
};

export type StudentQuizAttemptWithDetails = QuizAttempt & {
  assignment: AssignmentDataDto;
  student: AccountDTO;
};