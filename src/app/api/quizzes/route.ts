import { NextRequest } from 'next/server';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  withErrorHandling,
  parseRequestBody,
  validateRequiredFields
} from '@/lib/api-utils';
import { withRole } from '@/lib/auth-middleware';
import { mockDb, Question } from '@/lib/mock-database';
import { User, UserRole } from '@/types/auth';

interface CreateQuizRequest {
  title: string;
  description: string;
  subject: string;
  timeLimit: number;
  status: 'draft' | 'published' | 'archived';
  questions: Array<{
    type: 'multiple_choice' | 'true_false' | 'short_answer';
    question: string;
    options?: string[];
    correctAnswer: string;
    points: number;
  }>;
}

/**
 * GET /api/quizzes
 * Get all quizzes for the authenticated instructor
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    return withRole(UserRole.INSTRUCTOR, async (request: NextRequest, user: User) => {
      const quizzes = mockDb.getQuizzesByInstructor(user.id);
      
      // Transform quizzes to match frontend interface
      const transformedQuizzes = quizzes.map(quiz => ({
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
        averageScore: quiz.averageScore
      }));
      
      return createSuccessResponse(transformedQuizzes);
    })(request);
  });
}

/**
 * POST /api/quizzes
 * Create a new quiz
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    return withRole(UserRole.INSTRUCTOR, async (request: NextRequest, user: User) => {
      const body = await parseRequestBody<CreateQuizRequest>(request);
      
      // Validate required fields
      validateRequiredFields(body, ['title', 'description', 'subject', 'timeLimit', 'status', 'questions']);
      
      const { title, description, subject, timeLimit, status, questions } = body;
      
      // Validate questions array
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
      
      // Validate time limit
      if (timeLimit <= 0) {
        return createErrorResponse({
          code: 'INVALID_TIME_LIMIT',
          message: 'Time limit must be greater than 0'
        }, 400);
      }
      
      // Create quiz
      const quiz = mockDb.createQuiz({
        title,
        description,
        subject,
        questionsCount: questions.length,
        studentsCount: 0,
        attemptsCount: 0,
        timeLimit,
        status,
        averageScore: 0,
        instructorId: user.id,
        questions: []
      });
      
      // Create questions for the quiz
      const createdQuestions: Question[] = [];
      questions.forEach((questionData, index) => {
        const question: Question = {
          id: `question-${Date.now()}-${index}`,
          quizId: quiz.id,
          type: questionData.type,
          question: questionData.question,
          options: questionData.options,
          correctAnswer: questionData.correctAnswer,
          points: questionData.points,
          order: index + 1
        };
        createdQuestions.push(question);
      });
      
      // Update quiz with questions
      const updatedQuiz = mockDb.updateQuiz(quiz.id, {
        questions: createdQuestions
      });
      
      if (!updatedQuiz) {
        return createErrorResponse({
          code: 'QUIZ_CREATION_FAILED',
          message: 'Failed to create quiz'
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
      
      return createSuccessResponse(transformedQuiz, 201);
    })(request);
  });
}