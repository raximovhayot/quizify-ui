import { NextRequest } from 'next/server';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  withErrorHandling,
  parseRequestBody,
  validateRequiredFields
} from '@/lib/api-utils';
import { withRole } from '@/lib/auth-middleware';
import { mockDb } from '@/lib/mock-database';
import { User, UserRole } from '@/types/auth';

interface CreateAssignmentRequest {
  title: string;
  description: string;
  subject: string;
  quizId: string;
  attemptsAllowed: number;
  dueDate: string;
  status: 'active' | 'expired' | 'draft';
}

/**
 * GET /api/assignments
 * Get all assignments for the authenticated instructor
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    return withRole(UserRole.INSTRUCTOR, async (request: NextRequest, user: User) => {
      const assignments = mockDb.getAssignmentsByInstructor(user.id);
      
      // Transform assignments to match frontend interface
      const transformedAssignments = assignments.map(assignment => ({
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        subject: assignment.subject,
        assignmentCode: assignment.assignmentCode,
        quizTitle: assignment.quizTitle,
        studentsCount: assignment.studentsCount,
        submissionsCount: assignment.submissionsCount,
        attemptsAllowed: assignment.attemptsAllowed,
        dueDate: assignment.dueDate,
        status: assignment.status,
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
        averageScore: assignment.averageScore
      }));
      
      return createSuccessResponse(transformedAssignments);
    })(request);
  });
}

/**
 * POST /api/assignments
 * Create a new assignment
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    return withRole(UserRole.INSTRUCTOR, async (request: NextRequest, user: User) => {
      const body = await parseRequestBody<CreateAssignmentRequest>(request);
      
      // Validate required fields
      validateRequiredFields(body, ['title', 'description', 'subject', 'quizId', 'attemptsAllowed', 'dueDate', 'status']);
      
      const { title, description, subject, quizId, attemptsAllowed, dueDate, status } = body;
      
      // Validate quiz exists and belongs to instructor
      const quiz = mockDb.getQuizById(quizId);
      if (!quiz) {
        return createErrorResponse({
          code: 'QUIZ_NOT_FOUND',
          message: 'Quiz not found'
        }, 404);
      }
      
      if (quiz.instructorId !== user.id) {
        return createErrorResponse({
          code: 'UNAUTHORIZED',
          message: 'You do not have permission to use this quiz'
        }, 403);
      }
      
      // Validate attempts allowed
      if (attemptsAllowed <= 0) {
        return createErrorResponse({
          code: 'INVALID_ATTEMPTS',
          message: 'Attempts allowed must be greater than 0'
        }, 400);
      }
      
      // Validate due date
      const dueDateObj = new Date(dueDate);
      if (isNaN(dueDateObj.getTime())) {
        return createErrorResponse({
          code: 'INVALID_DUE_DATE',
          message: 'Invalid due date format'
        }, 400);
      }
      
      if (dueDateObj <= new Date()) {
        return createErrorResponse({
          code: 'INVALID_DUE_DATE',
          message: 'Due date must be in the future'
        }, 400);
      }
      
      // Generate unique assignment code
      const generateAssignmentCode = (): string => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };
      
      let assignmentCode = generateAssignmentCode();
      // Ensure code is unique
      while (mockDb.getAssignmentByCode(assignmentCode)) {
        assignmentCode = generateAssignmentCode();
      }
      
      // Create assignment
      const assignment = mockDb.createAssignment({
        title,
        description,
        subject,
        assignmentCode,
        quizId,
        quizTitle: quiz.title,
        studentsCount: 0,
        submissionsCount: 0,
        attemptsAllowed,
        dueDate,
        status,
        averageScore: 0,
        instructorId: user.id
      });
      
      // Transform assignment to match frontend interface
      const transformedAssignment = {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        subject: assignment.subject,
        assignmentCode: assignment.assignmentCode,
        quizTitle: assignment.quizTitle,
        studentsCount: assignment.studentsCount,
        submissionsCount: assignment.submissionsCount,
        attemptsAllowed: assignment.attemptsAllowed,
        dueDate: assignment.dueDate,
        status: assignment.status,
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
        averageScore: assignment.averageScore
      };
      
      return createSuccessResponse(transformedAssignment, 201);
    })(request);
  });
}