import { NextRequest } from 'next/server';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  withErrorHandling,
  parseRequestBody
} from '@/lib/api-utils';
import { withRole } from '@/lib/auth-middleware';
import { mockDb } from '@/lib/mock-database';
import { User, UserRole } from '@/types/auth';

interface UpdateAssignmentRequest {
  title?: string;
  description?: string;
  subject?: string;
  attemptsAllowed?: number;
  dueDate?: string;
  status?: 'active' | 'expired' | 'draft';
}

/**
 * GET /api/assignments/[id]
 * Get a specific assignment by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandling(async () => {
    return withRole(UserRole.INSTRUCTOR, async (request: NextRequest, user: User) => {
      const { id } = params;
      
      const assignment = mockDb.getAssignmentById(id);
      if (!assignment) {
        return createErrorResponse({
          code: 'ASSIGNMENT_NOT_FOUND',
          message: 'Assignment not found'
        }, 404);
      }
      
      // Check if the assignment belongs to the authenticated instructor
      if (assignment.instructorId !== user.id) {
        return createErrorResponse({
          code: 'UNAUTHORIZED',
          message: 'You do not have permission to access this assignment'
        }, 403);
      }
      
      // Get the associated quiz details
      const quiz = mockDb.getQuizById(assignment.quizId);
      
      // Transform assignment to include additional details
      const transformedAssignment = {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        subject: assignment.subject,
        assignmentCode: assignment.assignmentCode,
        quizId: assignment.quizId,
        quizTitle: assignment.quizTitle,
        studentsCount: assignment.studentsCount,
        submissionsCount: assignment.submissionsCount,
        attemptsAllowed: assignment.attemptsAllowed,
        dueDate: assignment.dueDate,
        status: assignment.status,
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
        averageScore: assignment.averageScore,
        quiz: quiz ? {
          id: quiz.id,
          title: quiz.title,
          questionsCount: quiz.questionsCount,
          timeLimit: quiz.timeLimit
        } : null
      };
      
      return createSuccessResponse(transformedAssignment);
    })(request);
  });
}

/**
 * PUT /api/assignments/[id]
 * Update a specific assignment
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandling(async () => {
    return withRole(UserRole.INSTRUCTOR, async (request: NextRequest, user: User) => {
      const { id } = params;
      const body = await parseRequestBody<UpdateAssignmentRequest>(request);
      
      const assignment = mockDb.getAssignmentById(id);
      if (!assignment) {
        return createErrorResponse({
          code: 'ASSIGNMENT_NOT_FOUND',
          message: 'Assignment not found'
        }, 404);
      }
      
      // Check if the assignment belongs to the authenticated instructor
      if (assignment.instructorId !== user.id) {
        return createErrorResponse({
          code: 'UNAUTHORIZED',
          message: 'You do not have permission to update this assignment'
        }, 403);
      }
      
      const { title, description, subject, attemptsAllowed, dueDate, status } = body;
      
      // Validate attempts allowed if provided
      if (attemptsAllowed !== undefined && attemptsAllowed <= 0) {
        return createErrorResponse({
          code: 'INVALID_ATTEMPTS',
          message: 'Attempts allowed must be greater than 0'
        }, 400);
      }
      
      // Validate due date if provided
      if (dueDate !== undefined) {
        const dueDateObj = new Date(dueDate);
        if (isNaN(dueDateObj.getTime())) {
          return createErrorResponse({
            code: 'INVALID_DUE_DATE',
            message: 'Invalid due date format'
          }, 400);
        }
        
        // Allow updating to past dates for expired assignments
        if (status !== 'expired' && dueDateObj <= new Date()) {
          return createErrorResponse({
            code: 'INVALID_DUE_DATE',
            message: 'Due date must be in the future for active assignments'
          }, 400);
        }
      }
      
      // Prepare update data
      const updateData: Partial<{
        title: string;
        description: string;
        subject: string;
        attemptsAllowed: number;
        dueDate: string;
        status: 'active' | 'expired' | 'draft';
      }> = {};
      
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (subject !== undefined) updateData.subject = subject;
      if (attemptsAllowed !== undefined) updateData.attemptsAllowed = attemptsAllowed;
      if (dueDate !== undefined) updateData.dueDate = dueDate;
      if (status !== undefined) updateData.status = status;
      
      // Update assignment
      const updatedAssignment = mockDb.updateAssignment(id, updateData);
      
      if (!updatedAssignment) {
        return createErrorResponse({
          code: 'ASSIGNMENT_UPDATE_FAILED',
          message: 'Failed to update assignment'
        }, 500);
      }
      
      // Transform assignment to match frontend interface
      const transformedAssignment = {
        id: updatedAssignment.id,
        title: updatedAssignment.title,
        description: updatedAssignment.description,
        subject: updatedAssignment.subject,
        assignmentCode: updatedAssignment.assignmentCode,
        quizTitle: updatedAssignment.quizTitle,
        studentsCount: updatedAssignment.studentsCount,
        submissionsCount: updatedAssignment.submissionsCount,
        attemptsAllowed: updatedAssignment.attemptsAllowed,
        dueDate: updatedAssignment.dueDate,
        status: updatedAssignment.status,
        createdAt: updatedAssignment.createdAt,
        updatedAt: updatedAssignment.updatedAt,
        averageScore: updatedAssignment.averageScore
      };
      
      return createSuccessResponse(transformedAssignment);
    })(request);
  });
}

/**
 * DELETE /api/assignments/[id]
 * Delete a specific assignment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandling(async () => {
    return withRole(UserRole.INSTRUCTOR, async (request: NextRequest, user: User) => {
      const { id } = params;
      
      const assignment = mockDb.getAssignmentById(id);
      if (!assignment) {
        return createErrorResponse({
          code: 'ASSIGNMENT_NOT_FOUND',
          message: 'Assignment not found'
        }, 404);
      }
      
      // Check if the assignment belongs to the authenticated instructor
      if (assignment.instructorId !== user.id) {
        return createErrorResponse({
          code: 'UNAUTHORIZED',
          message: 'You do not have permission to delete this assignment'
        }, 403);
      }
      
      // Check if assignment has student submissions
      if (assignment.submissionsCount > 0) {
        return createErrorResponse({
          code: 'ASSIGNMENT_HAS_SUBMISSIONS',
          message: 'Cannot delete assignment that has student submissions'
        }, 409);
      }
      
      // Delete the assignment
      const deleted = mockDb.deleteAssignment(id);
      
      if (!deleted) {
        return createErrorResponse({
          code: 'ASSIGNMENT_DELETE_FAILED',
          message: 'Failed to delete assignment'
        }, 500);
      }
      
      // Return success response (no content)
      return createSuccessResponse(null, 204);
    })(request);
  });
}