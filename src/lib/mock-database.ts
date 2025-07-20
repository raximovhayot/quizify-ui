import { User, UserRole, UserState } from '@/types/auth';
import { Language } from '@/types/common';

/**
 * Quiz interface for database
 */
export interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  questionsCount: number;
  studentsCount: number;
  attemptsCount: number;
  timeLimit: number;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  averageScore?: number;
  instructorId: string;
  questions: Question[];
}

/**
 * Question interface for database
 */
export interface Question {
  id: string;
  quizId: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  question: string;
  options?: string[];
  correctAnswer: string;
  points: number;
  order: number;
}

/**
 * Assignment interface for database
 */
export interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  assignmentCode: string;
  quizId: string;
  quizTitle: string;
  studentsCount: number;
  submissionsCount: number;
  attemptsAllowed: number;
  dueDate: string;
  status: 'active' | 'expired' | 'draft';
  createdAt: string;
  updatedAt: string;
  averageScore?: number;
  instructorId: string;
}

/**
 * Quiz attempt interface for database
 */
export interface QuizAttempt {
  id: string;
  quizId: string;
  assignmentId?: string;
  studentId: string;
  startTime: string;
  endTime?: string;
  score?: number;
  status: 'started' | 'in_progress' | 'completed' | 'abandoned';
  answers: QuizAnswer[];
  timeElapsed: number;
}

/**
 * Quiz answer interface for database
 */
export interface QuizAnswer {
  questionId: string;
  answer: string;
  isCorrect?: boolean;
  points?: number;
}

/**
 * Mock in-memory database
 */
class MockDatabase {
  private users: Map<string, User> = new Map();
  private quizzes: Map<string, Quiz> = new Map();
  private questions: Map<string, Question> = new Map();
  private assignments: Map<string, Assignment> = new Map();
  private attempts: Map<string, QuizAttempt> = new Map();
  private refreshTokens: Map<string, { userId: string; expiresAt: Date }> = new Map();

  constructor() {
    this.seedData();
  }

  /**
   * Seed initial data
   */
  private seedData(): void {
    // Create mock users
    const instructor: User = {
      id: 'instructor-1',
      phone: '+998901234567',
      firstName: 'John',
      lastName: 'Instructor',
      roles: [UserRole.INSTRUCTOR],
      state: UserState.ACTIVE,
      language: Language.EN
    };

    const student: User = {
      id: 'student-1',
      phone: '+998901234568',
      firstName: 'Jane',
      lastName: 'Student',
      roles: [UserRole.STUDENT],
      state: UserState.ACTIVE,
      language: Language.EN
    };

    this.users.set(instructor.id, instructor);
    this.users.set(student.id, student);

    // Create mock quiz
    const quiz: Quiz = {
      id: 'quiz-1',
      title: 'Mathematics Quiz #1',
      description: 'Basic algebra and geometry concepts',
      subject: 'Mathematics',
      questionsCount: 3,
      studentsCount: 25,
      attemptsCount: 45,
      timeLimit: 30,
      status: 'published',
      createdAt: '2024-07-15T10:00:00Z',
      updatedAt: '2024-07-16T14:30:00Z',
      averageScore: 78.5,
      instructorId: instructor.id,
      questions: []
    };

    this.quizzes.set(quiz.id, quiz);

    // Create mock questions
    const questions: Question[] = [
      {
        id: 'question-1',
        quizId: quiz.id,
        type: 'multiple_choice',
        question: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        correctAnswer: '4',
        points: 10,
        order: 1
      },
      {
        id: 'question-2',
        quizId: quiz.id,
        type: 'true_false',
        question: 'The square root of 16 is 4.',
        options: ['True', 'False'],
        correctAnswer: 'True',
        points: 10,
        order: 2
      },
      {
        id: 'question-3',
        quizId: quiz.id,
        type: 'short_answer',
        question: 'What is the area of a rectangle with width 5 and height 3?',
        correctAnswer: '15',
        points: 15,
        order: 3
      }
    ];

    questions.forEach(q => {
      this.questions.set(q.id, q);
      quiz.questions.push(q);
    });

    // Create mock assignment
    const assignment: Assignment = {
      id: 'assignment-1',
      title: 'Mathematics Assignment #1',
      description: 'Basic algebra and geometry quiz assignment',
      subject: 'Mathematics',
      assignmentCode: 'MATH01',
      quizId: quiz.id,
      quizTitle: quiz.title,
      studentsCount: 25,
      submissionsCount: 18,
      attemptsAllowed: 2,
      dueDate: '2024-07-25T23:59:00Z',
      status: 'active',
      createdAt: '2024-07-15T10:00:00Z',
      updatedAt: '2024-07-16T14:30:00Z',
      averageScore: 78.5,
      instructorId: instructor.id
    };

    this.assignments.set(assignment.id, assignment);
  }

  // User operations
  getUserByPhone(phone: string): User | null {
    return Array.from(this.users.values()).find(user => user.phone === phone) || null;
  }

  getUserById(id: string): User | null {
    return this.users.get(id) || null;
  }

  createUser(userData: Omit<User, 'id'>): User {
    const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const user: User = { ...userData, id };
    this.users.set(id, user);
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const user = this.users.get(id);
    if (!user) return null;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Quiz operations
  getQuizzesByInstructor(instructorId: string): Quiz[] {
    return Array.from(this.quizzes.values()).filter(quiz => quiz.instructorId === instructorId);
  }

  getQuizById(id: string): Quiz | null {
    return this.quizzes.get(id) || null;
  }

  createQuiz(quizData: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>): Quiz {
    const id = `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    const quiz: Quiz = {
      ...quizData,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.quizzes.set(id, quiz);
    return quiz;
  }

  updateQuiz(id: string, updates: Partial<Quiz>): Quiz | null {
    const quiz = this.quizzes.get(id);
    if (!quiz) return null;
    
    const updatedQuiz = { ...quiz, ...updates, updatedAt: new Date().toISOString() };
    this.quizzes.set(id, updatedQuiz);
    return updatedQuiz;
  }

  deleteQuiz(id: string): boolean {
    return this.quizzes.delete(id);
  }

  // Assignment operations
  getAssignmentsByInstructor(instructorId: string): Assignment[] {
    return Array.from(this.assignments.values()).filter(assignment => assignment.instructorId === instructorId);
  }

  getAssignmentById(id: string): Assignment | null {
    return this.assignments.get(id) || null;
  }

  getAssignmentByCode(code: string): Assignment | null {
    return Array.from(this.assignments.values()).find(assignment => assignment.assignmentCode === code) || null;
  }

  createAssignment(assignmentData: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt'>): Assignment {
    const id = `assignment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    const assignment: Assignment = {
      ...assignmentData,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.assignments.set(id, assignment);
    return assignment;
  }

  updateAssignment(id: string, updates: Partial<Assignment>): Assignment | null {
    const assignment = this.assignments.get(id);
    if (!assignment) return null;
    
    const updatedAssignment = { ...assignment, ...updates, updatedAt: new Date().toISOString() };
    this.assignments.set(id, updatedAssignment);
    return updatedAssignment;
  }

  deleteAssignment(id: string): boolean {
    return this.assignments.delete(id);
  }

  // Quiz attempt operations
  getAttemptsByStudent(studentId: string): QuizAttempt[] {
    return Array.from(this.attempts.values()).filter(attempt => attempt.studentId === studentId);
  }

  getAttemptById(id: string): QuizAttempt | null {
    return this.attempts.get(id) || null;
  }

  createAttempt(attemptData: Omit<QuizAttempt, 'id'>): QuizAttempt {
    const id = `attempt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const attempt: QuizAttempt = { ...attemptData, id };
    this.attempts.set(id, attempt);
    return attempt;
  }

  updateAttempt(id: string, updates: Partial<QuizAttempt>): QuizAttempt | null {
    const attempt = this.attempts.get(id);
    if (!attempt) return null;
    
    const updatedAttempt = { ...attempt, ...updates };
    this.attempts.set(id, updatedAttempt);
    return updatedAttempt;
  }

  // Refresh token operations
  storeRefreshToken(token: string, userId: string, expiresAt: Date): void {
    this.refreshTokens.set(token, { userId, expiresAt });
  }

  getRefreshToken(token: string): { userId: string; expiresAt: Date } | null {
    const tokenData = this.refreshTokens.get(token);
    if (!tokenData || tokenData.expiresAt < new Date()) {
      this.refreshTokens.delete(token);
      return null;
    }
    return tokenData;
  }

  deleteRefreshToken(token: string): boolean {
    return this.refreshTokens.delete(token);
  }

  // Analytics operations
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getAnalyticsData(_instructorId: string): {
    quizPerformance: Array<{
      name: string;
      averageScore: number;
      attempts: number;
      completionRate: number;
    }>;
    studentProgress: Array<{
      date: string;
      activeStudents: number;
      completedQuizzes: number;
    }>;
    scoreDistribution: Array<{
      range: string;
      count: number;
      percentage: number;
    }>;
    topPerformers: Array<{
      name: string;
      averageScore: number;
      quizzesCompleted: number;
    }>;
  } {
    // Mock analytics data - in real app, this would be calculated from actual data
    return {
      quizPerformance: [
        { name: 'Math Quiz #1', averageScore: 85, attempts: 45, completionRate: 89 },
        { name: 'Physics Quiz #2', averageScore: 78, attempts: 38, completionRate: 76 },
        { name: 'Chemistry Quiz #1', averageScore: 92, attempts: 42, completionRate: 95 },
      ],
      studentProgress: [
        { date: '2024-01-01', activeStudents: 25, completedQuizzes: 12 },
        { date: '2024-01-08', activeStudents: 28, completedQuizzes: 18 },
        { date: '2024-01-15', activeStudents: 32, completedQuizzes: 24 },
      ],
      scoreDistribution: [
        { range: '90-100%', count: 15, percentage: 33 },
        { range: '80-89%', count: 12, percentage: 27 },
        { range: '70-79%', count: 10, percentage: 22 },
        { range: '60-69%', count: 6, percentage: 13 },
        { range: '0-59%', count: 2, percentage: 5 },
      ],
      topPerformers: [
        { name: 'Alice Johnson', averageScore: 95, quizzesCompleted: 8 },
        { name: 'Bob Smith', averageScore: 92, quizzesCompleted: 7 },
        { name: 'Carol Davis', averageScore: 90, quizzesCompleted: 9 },
      ],
    };
  }
}

// Export singleton instance
export const mockDb = new MockDatabase();