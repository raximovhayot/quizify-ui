import { NextRequest } from 'next/server';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  withErrorHandling,
  parseRequestBody
} from '@/lib/api-utils';
import { withRole } from '@/lib/auth-middleware';
import { mockDb, Question } from '@/lib/mock-database';
import { User, UserRole } from '@/types/auth';
import { UpdateQuizRequest } from '@/types/quizzes';

/**
 * GET /api/quizzes/[id]
 * Get a specific quiz by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandling(async () => {
    return withRole(UserRole.INSTRUCTOR, async (request: NextRequest, user: User) => {
      const { id } = params;
      
      const quiz = mockDb.getQuizById(id);
      if (!quiz) {
        return createErrorResponse({
          code: 'QUIZ_NOT_FOUND',
          message: 'Quiz not found'
        }, 404);
      }
      
      // Check if the quiz belongs to the authenticated instructor
      if (quiz.instructorId !== user.id) {
        return createErrorResponse({
          code: 'UNAUTHORIZED',
          message: 'You do not have permission to access this quiz'
        }, 403);
      }
      
      // Transform quiz to include questions
      const transformedQuiz = {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        subject: quiz.subject,
        questionsCount: quiz.questionsCount,
        studentsCount: quiz.studentsCount,
        attemptsCount: quiz.attemptsCount,
        timeLimit: quiz.timeLimit,
        status: quiz.status,
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt,
        averageScore: quiz.averageScore,
        questions: quiz.questions.map(q => ({
          id: q.id,
          type: q.type,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: q.points,
          order: q.order
        }))
      };
      
      return createSuccessResponse(transformedQuiz);
    })(request);
  });
}

/**
 * PUT /api/quizzes/[id]
 * Update a specific quiz
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandling(async () => {
    return withRole(UserRole.INSTRUCTOR, async (request: NextRequest, user: User) => {
      const { id } = params;
      const body = await parseRequestBody<UpdateQuizRequest>(request);
      
      const quiz = mockDb.getQuizById(id);
      if (!quiz) {
        return createErrorResponse({
          code: 'QUIZ_NOT_FOUND',
          message: 'Quiz not found'
        }, 404);
      }
      
      // Check if the quiz belongs to the authenticated instructor
      if (quiz.instructorId !== user.id) {
        return createErrorResponse({
          code: 'UNAUTHORIZED',
          message: 'You do not have permission to update this quiz'
        }, 403);
      }
      
      const { title, description, subject, timeLimit, status, questions } = body;
      
      // Validate time limit if provided
      if (timeLimit !== undefined && timeLimit <= 0) {
        return createErrorResponse({
          code: 'INVALID_TIME_LIMIT',
          message: 'Time limit must be greater than 0'
        }, 400);
      }
      
      // Validate questions if provided
      if (questions !== undefined) {
        if (!Array.isArray(questions) || questions.length === 0) {
          return createErrorResponse({
            code: 'INVALID_QUESTIONS',
            message: 'Quiz must have at least one question'
          }, 400);
        }
        
        // Validate each question
        for (let i = 0; i < questions.length; i++) {
          const question = questions[i];
          
          if (!question.question || !question.correctAnswer || !question.points) {
            return createErrorResponse({
              code: 'INVALID_QUESTION',
              message: `Question ${i + 1} is missing required fields`
            }, 400);
          }
          
          if (question.type === 'multiple_choice' && (!question.options || question.options.length < 2)) {
            return createErrorResponse({
              code: 'INVALID_QUESTION',
              message: `Multiple choice question ${i + 1} must have at least 2 options`
            }, 400);
          }
          
          if (question.points <= 0) {
            return createErrorResponse({
              code: 'INVALID_QUESTION',
              message: `Question ${i + 1} must have positive points`
            }, 400);
          }
        }
      }
      
      // Prepare update data
      const updateData: Partial<{
        title: string;
        description: string;
        subject: string;
        timeLimit: number;
        status: 'draft' | 'published' | 'archived';
        questions: Question[];
        questionsCount: number;
      }> = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (subject !== undefined) updateData.subject = subject;
      if (timeLimit !== undefined) updateData.timeLimit = timeLimit;
      if (status !== undefined) updateData.status = status;
      
      // Handle questions update
      if (questions !== undefined) {
        const updatedQuestions: Question[] = [];
        questions.forEach((questionData, index) => {
          const question: Question = {
            id: questionData.id || `question-${Date.now()}-${index}`,
            quizId: quiz.id,
            type: questionData.type,
            question: questionData.question,
            options: questionData.options,
            correctAnswer: questionData.correctAnswer,
            points: questionData.points,
            order: index + 1
          };
          updatedQuestions.push(question);
        });
        
        updateData.questions = updatedQuestions;
        updateData.questionsCount = updatedQuestions.length;
      }
      
      // Update quiz
      const updatedQuiz = mockDb.updateQuiz(id, updateData);
      
      if (!updatedQuiz) {
        return createErrorResponse({
          code: 'QUIZ_UPDATE_FAILED',
          message: 'Failed to update quiz'
        }, 500);
      }
      
      // Transform quiz to match frontend interface
      const transformedQuiz = {
        id: updatedQuiz.id,
        title: updatedQuiz.title,
        description: updatedQuiz.description,
        subject: updatedQuiz.subject,
        questionsCount: updatedQuiz.questionsCount,
        studentsCount: updatedQuiz.studentsCount,
        attemptsCount: updatedQuiz.attemptsCount,
        timeLimit: updatedQuiz.timeLimit,
        status: updatedQuiz.status,
        createdAt: updatedQuiz.createdAt,
        updatedAt: updatedQuiz.updatedAt,
        averageScore: updatedQuiz.averageScore
      };
      
      return createSuccessResponse(transformedQuiz);
    })(request);
  });
}

/**
 * DELETE /api/quizzes/[id]
 * Delete a specific quiz
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandling(async () => {
    return withRole(UserRole.INSTRUCTOR, async (request: NextRequest, user: User) => {
      const { id } = params;
      
      const quiz = mockDb.getQuizById(id);
      if (!quiz) {
        return createErrorResponse({
          code: 'QUIZ_NOT_FOUND',
          message: 'Quiz not found'
        }, 404);
      }
      
      // Check if the quiz belongs to the authenticated instructor
      if (quiz.instructorId !== user.id) {
        return createErrorResponse({
          code: 'UNAUTHORIZED',
          message: 'You do not have permission to delete this quiz'
        }, 403);
      }
      
      // Check if quiz has active assignments
      // In a real application, you would check for dependencies
      if (quiz.status === 'published' && quiz.studentsCount > 0) {
        return createErrorResponse({
          code: 'QUIZ_IN_USE',
          message: 'Cannot delete quiz that has active student assignments'
        }, 409);
      }
      
      // Delete the quiz
      const deleted = mockDb.deleteQuiz(id);
      
      if (!deleted) {
        return createErrorResponse({
          code: 'QUIZ_DELETE_FAILED',
          message: 'Failed to delete quiz'
        }, 500);
      }
      
      // Return success response (no content)
      return createSuccessResponse(null, 204);
    })(request);
  });
}