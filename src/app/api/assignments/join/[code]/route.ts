import { NextRequest } from 'next/server';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  withErrorHandling
} from '@/lib/api-utils';
import { withRole } from '@/lib/auth-middleware';
import { mockDb } from '@/lib/mock-database';
import { User, UserRole } from '@/types/auth';

/**
 * GET /api/assignments/join/[code]
 * Join an assignment using assignment code (for students)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  return withErrorHandling(async () => {
    return withRole(UserRole.STUDENT, async (request: NextRequest, user: User) => {
      const { code } = params;
      
      // Find assignment by code
      const assignment = mockDb.getAssignmentByCode(code.toUpperCase());
      if (!assignment) {
        return createErrorResponse({
          code: 'ASSIGNMENT_NOT_FOUND',
          message: 'Assignment not found. Please check the assignment code.'
        }, 404);
      }
      
      // Check if assignment is active
      if (assignment.status !== 'active') {
        return createErrorResponse({
          code: 'ASSIGNMENT_INACTIVE',
          message: 'This assignment is not currently active.'
        }, 400);
      }
      
      // Check if assignment has expired
      const dueDate = new Date(assignment.dueDate);
      if (dueDate < new Date()) {
        return createErrorResponse({
          code: 'ASSIGNMENT_EXPIRED',
          message: 'This assignment has expired.'
        }, 400);
      }
      
      // Get the associated quiz
      const quiz = mockDb.getQuizById(assignment.quizId);
      if (!quiz) {
        return createErrorResponse({
          code: 'QUIZ_NOT_FOUND',
          message: 'Associated quiz not found.'
        }, 404);
      }
      
      // Check if quiz is published
      if (quiz.status !== 'published') {
        return createErrorResponse({
          code: 'QUIZ_NOT_PUBLISHED',
          message: 'The quiz for this assignment is not published.'
        }, 400);
      }
      
      // Check if student has already reached attempt limit
      const existingAttempts = mockDb.getAttemptsByStudent(user.id)
        .filter(attempt => attempt.assignmentId === assignment.id);
      
      if (existingAttempts.length >= assignment.attemptsAllowed) {
        return createErrorResponse({
          code: 'ATTEMPT_LIMIT_REACHED',
          message: `You have already used all ${assignment.attemptsAllowed} attempts for this assignment.`
        }, 400);
      }
      
      // Get instructor information
      const instructor = mockDb.getUserById(assignment.instructorId);
      
      // Return assignment and quiz information for the student
      const assignmentInfo = {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        subject: assignment.subject,
        assignmentCode: assignment.assignmentCode,
        dueDate: assignment.dueDate,
        attemptsAllowed: assignment.attemptsAllowed,
        attemptsUsed: existingAttempts.length,
        attemptsRemaining: assignment.attemptsAllowed - existingAttempts.length,
        instructor: instructor ? {
          firstName: instructor.firstName,
          lastName: instructor.lastName
        } : null,
        quiz: {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          questionsCount: quiz.questionsCount,
          timeLimit: quiz.timeLimit
        },
        canStartAttempt: existingAttempts.length < assignment.attemptsAllowed,
        lastAttempt: existingAttempts.length > 0 ? {
          id: existingAttempts[existingAttempts.length - 1].id,
          startTime: existingAttempts[existingAttempts.length - 1].startTime,
          endTime: existingAttempts[existingAttempts.length - 1].endTime,
          score: existingAttempts[existingAttempts.length - 1].score,
          status: existingAttempts[existingAttempts.length - 1].status
        } : null
      };
      
      return createSuccessResponse(assignmentInfo);
    })(request);
  });
}

/**
 * POST /api/assignments/join/[code]
 * Start a new quiz attempt for the assignment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  return withErrorHandling(async () => {
    return withRole(UserRole.STUDENT, async (request: NextRequest, user: User) => {
      const { code } = params;
      
      // Find assignment by code
      const assignment = mockDb.getAssignmentByCode(code.toUpperCase());
      if (!assignment) {
        return createErrorResponse({
          code: 'ASSIGNMENT_NOT_FOUND',
          message: 'Assignment not found. Please check the assignment code.'
        }, 404);
      }
      
      // Check if assignment is active
      if (assignment.status !== 'active') {
        return createErrorResponse({
          code: 'ASSIGNMENT_INACTIVE',
          message: 'This assignment is not currently active.'
        }, 400);
      }
      
      // Check if assignment has expired
      const dueDate = new Date(assignment.dueDate);
      if (dueDate < new Date()) {
        return createErrorResponse({
          code: 'ASSIGNMENT_EXPIRED',
          message: 'This assignment has expired.'
        }, 400);
      }
      
      // Get the associated quiz
      const quiz = mockDb.getQuizById(assignment.quizId);
      if (!quiz) {
        return createErrorResponse({
          code: 'QUIZ_NOT_FOUND',
          message: 'Associated quiz not found.'
        }, 404);
      }
      
      // Check if student has already reached attempt limit
      const existingAttempts = mockDb.getAttemptsByStudent(user.id)
        .filter(attempt => attempt.assignmentId === assignment.id);
      
      if (existingAttempts.length >= assignment.attemptsAllowed) {
        return createErrorResponse({
          code: 'ATTEMPT_LIMIT_REACHED',
          message: `You have already used all ${assignment.attemptsAllowed} attempts for this assignment.`
        }, 400);
      }
      
      // Check if student has an active (in-progress) attempt
      const activeAttempt = existingAttempts.find(attempt => 
        attempt.status === 'started' || attempt.status === 'in_progress'
      );
      
      if (activeAttempt) {
        return createErrorResponse({
          code: 'ACTIVE_ATTEMPT_EXISTS',
          message: 'You already have an active attempt for this assignment. Please complete it first.'
        }, 400);
      }
      
      // Create new quiz attempt
      const attempt = mockDb.createAttempt({
        quizId: quiz.id,
        assignmentId: assignment.id,
        studentId: user.id,
        startTime: new Date().toISOString(),
        status: 'started',
        answers: [],
        timeElapsed: 0
      });
      
      // Return attempt information with quiz questions (without correct answers)
      const attemptInfo = {
        id: attempt.id,
        assignmentId: assignment.id,
        quizId: quiz.id,
        startTime: attempt.startTime,
        timeLimit: quiz.timeLimit,
        questions: quiz.questions.map(q => ({
          id: q.id,
          type: q.type,
          question: q.question,
          options: q.options,
          points: q.points,
          order: q.order
          // Note: correctAnswer is intentionally excluded for security
        }))
      };
      
      return createSuccessResponse(attemptInfo, 201);
    })(request);
  });
}