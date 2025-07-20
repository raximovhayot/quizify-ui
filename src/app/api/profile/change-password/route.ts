import { NextRequest } from 'next/server';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  withErrorHandling,
  parseRequestBody,
  validateRequiredFields
} from '@/lib/api-utils';
import { withAuth } from '@/lib/auth-middleware';
import { User } from '@/types/auth';

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * POST /api/profile/change-password
 * Change current user's password
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    return withAuth(async (request: NextRequest, user: User) => {
      const body = await parseRequestBody<ChangePasswordRequest>(request);
      
      // Validate required fields
      validateRequiredFields(body, ['currentPassword', 'newPassword']);
      
      const { currentPassword, newPassword } = body;
      
      // In a real application, you would verify the current password
      // For this mock implementation, we'll use a simple password check
      const mockPassword = 'password123'; // Mock password for all users
      if (currentPassword !== mockPassword) {
        return createErrorResponse({
          code: 'INVALID_CURRENT_PASSWORD',
          message: 'Current password is incorrect'
        }, 400);
      }
      
      // Validate new password strength
      if (newPassword.length < 6) {
        return createErrorResponse({
          code: 'WEAK_PASSWORD',
          message: 'New password must be at least 6 characters long'
        }, 400);
      }
      
      // Check if new password is different from current password
      if (currentPassword === newPassword) {
        return createErrorResponse({
          code: 'SAME_PASSWORD',
          message: 'New password must be different from current password'
        }, 400);
      }
      
      // In a real application, you would hash the new password and update it in the database
      // For this mock implementation, we're not storing passwords
      console.log(`Password changed successfully for user ${user.id}: ${newPassword}`);
      
      // Return success response (no data needed)
      return createSuccessResponse(null, 204);
    })(request);
  });
}