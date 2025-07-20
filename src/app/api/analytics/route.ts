import { NextRequest } from 'next/server';
import { 
  createSuccessResponse, 
  withErrorHandling,
  getQueryParams
} from '@/lib/api-utils';
import { withRole } from '@/lib/auth-middleware';
import { mockDb } from '@/lib/mock-database';
import { User, UserRole } from '@/types/auth';

/**
 * GET /api/analytics
 * Get analytics data for the authenticated instructor
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    return withRole(UserRole.INSTRUCTOR, async (request: NextRequest, user: User) => {
      const queryParams = getQueryParams(request.url);
      const period = queryParams.get('period') || 'month'; // week, month, quarter
      
      // Get analytics data from mock database
      const analyticsData = mockDb.getAnalyticsData(user.id);
      
      // In a real application, you would filter and calculate data based on the period
      // For now, we'll return the mock data with some period-based adjustments
      
      let periodMultiplier = 1;
      switch (period) {
        case 'week':
          periodMultiplier = 0.25;
          break;
        case 'month':
          periodMultiplier = 1;
          break;
        case 'quarter':
          periodMultiplier = 3;
          break;
      }
      
      // Adjust data based on period
      const adjustedData = {
        ...analyticsData,
        quizPerformance: analyticsData.quizPerformance.map(quiz => ({
          ...quiz,
          attempts: Math.round(quiz.attempts * periodMultiplier),
        })),
        studentProgress: analyticsData.studentProgress.map(progress => ({
          ...progress,
          activeStudents: Math.round(progress.activeStudents * periodMultiplier),
          completedQuizzes: Math.round(progress.completedQuizzes * periodMultiplier),
        })),
        scoreDistribution: analyticsData.scoreDistribution.map(dist => ({
          ...dist,
          count: Math.round(dist.count * periodMultiplier),
        })),
      };
      
      // Add summary statistics
      const summaryStats = {
        totalAttempts: adjustedData.quizPerformance.reduce((sum, quiz) => sum + quiz.attempts, 0),
        averageScore: Math.round(
          adjustedData.quizPerformance.reduce((sum, quiz) => sum + quiz.averageScore, 0) / 
          adjustedData.quizPerformance.length
        ),
        completionRate: Math.round(
          adjustedData.quizPerformance.reduce((sum, quiz) => sum + quiz.completionRate, 0) / 
          adjustedData.quizPerformance.length
        ),
        activeStudents: adjustedData.studentProgress[adjustedData.studentProgress.length - 1]?.activeStudents || 0,
        totalQuizzes: adjustedData.quizPerformance.length,
        period: period
      };
      
      const response = {
        summary: summaryStats,
        quizPerformance: adjustedData.quizPerformance,
        studentProgress: adjustedData.studentProgress,
        scoreDistribution: adjustedData.scoreDistribution,
        topPerformers: adjustedData.topPerformers,
        generatedAt: new Date().toISOString()
      };
      
      return createSuccessResponse(response);
    })(request);
  });
}