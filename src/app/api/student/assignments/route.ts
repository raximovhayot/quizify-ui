import { NextRequest } from 'next/server';
import { 
  createSuccessResponse, 
  withErrorHandling
} from '@/lib/api-utils';
import { withRole } from '@/lib/auth-middleware';
import { mockDb } from '@/lib/mock-database';
import { User, UserRole } from '@/types/auth';

/**
 * GET /api/student/assignments
 * Get all assignments that the student has joined or attempted
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    return withRole(UserRole.STUDENT, async (request: NextRequest, user: User) => {
      // Get all attempts by the student
      const studentAttempts = mockDb.getAttemptsByStudent(user.id);
      
      // Get unique assignment IDs from attempts
      const assignmentIds = [...new Set(studentAttempts
        .filter(attempt => attempt.assignmentId)
        .map(attempt => attempt.assignmentId!)
      )];
      
      // Get assignment details for each assignment
      const studentAssignments = assignmentIds.map(assignmentId => {
        const assignment = mockDb.getAssignmentById(assignmentId);
        if (!assignment) return null;
        
        const quiz = mockDb.getQuizById(assignment.quizId);
        const instructor = mockDb.getUserById(assignment.instructorId);
        
        // Get attempts for this specific assignment
        const assignmentAttempts = studentAttempts.filter(attempt => 
          attempt.assignmentId === assignmentId
        );
        
        // Calculate best score
        const completedAttempts = assignmentAttempts.filter(attempt => 
          attempt.status === 'completed' && attempt.score !== undefined
        );
        const bestScore = completedAttempts.length > 0 
          ? Math.max(...completedAttempts.map(attempt => attempt.score!))
          : null;
        
        // Get latest attempt
        const latestAttempt = assignmentAttempts.length > 0 
          ? assignmentAttempts[assignmentAttempts.length - 1]
          : null;
        
        return {
          id: assignment.id,
          title: assignment.title,
          description: assignment.description,
          subject: assignment.subject,
          assignmentCode: assignment.assignmentCode,
          dueDate: assignment.dueDate,
          status: assignment.status,
          attemptsAllowed: assignment.attemptsAllowed,
          attemptsUsed: assignmentAttempts.length,
          attemptsRemaining: assignment.attemptsAllowed - assignmentAttempts.length,
          bestScore: bestScore,
          instructor: instructor ? {
            firstName: instructor.firstName,
            lastName: instructor.lastName
          } : null,
          quiz: quiz ? {
            id: quiz.id,
            title: quiz.title,
            questionsCount: quiz.questionsCount,
            timeLimit: quiz.timeLimit
          } : null,
          latestAttempt: latestAttempt ? {
            id: latestAttempt.id,
            startTime: latestAttempt.startTime,
            endTime: latestAttempt.endTime,
            score: latestAttempt.score,
            status: latestAttempt.status,
            timeElapsed: latestAttempt.timeElapsed
          } : null,
          canStartNewAttempt: assignmentAttempts.length < assignment.attemptsAllowed &&
                              assignment.status === 'active' &&
                              new Date(assignment.dueDate) > new Date(),
          isExpired: new Date(assignment.dueDate) <= new Date()
        };
      }).filter(assignment => assignment !== null);
      
      // Sort by latest activity (most recent first)
      studentAssignments.sort((a, b) => {
        const aTime = a.latestAttempt?.startTime || a.dueDate;
        const bTime = b.latestAttempt?.startTime || b.dueDate;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });
      
      return createSuccessResponse(studentAssignments);
    })(request);
  });
}