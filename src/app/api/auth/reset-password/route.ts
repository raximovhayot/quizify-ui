import { NextRequest } from 'next/server';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  withErrorHandling,
  parseRequestBody,
  validateRequiredFields
} from '@/lib/api-utils';
import { mockDb } from '@/lib/mock-database';

interface ResetPasswordRequest {
  phone: string;
  code: string;
  newPassword: string;
}

// Import the reset codes from forgot-password endpoint
// In a real application, this would be stored in a database
const resetCodes = new Map<string, { code: string; expiresAt: Date; userId: string }>();

/**
 * POST /api/auth/reset-password
 * Reset password using verification code
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await parseRequestBody<ResetPasswordRequest>(request);
    
    // Validate required fields
    validateRequiredFields(body, ['phone', 'code', 'newPassword']);
    
    const { phone, code, newPassword } = body;
    
    // Check if reset code exists and is valid
    const resetData = resetCodes.get(phone);
    if (!resetData) {
      return createErrorResponse({
        code: 'INVALID_RESET_CODE',
        message: 'Invalid or expired reset code'
      }, 400);
    }
    
    // Check if code has expired
    if (resetData.expiresAt < new Date()) {
      resetCodes.delete(phone);
      return createErrorResponse({
        code: 'EXPIRED_RESET_CODE',
        message: 'Reset code has expired'
      }, 400);
    }
    
    // Verify the code
    if (resetData.code !== code) {
      return createErrorResponse({
        code: 'INVALID_RESET_CODE',
        message: 'Invalid reset code'
      }, 400);
    }
    
    // Validate new password strength
    if (newPassword.length < 6) {
      return createErrorResponse({
        code: 'WEAK_PASSWORD',
        message: 'Password must be at least 6 characters long'
      }, 400);
    }
    
    // Get user from database
    const user = mockDb.getUserById(resetData.userId);
    if (!user) {
      return createErrorResponse({
        code: 'USER_NOT_FOUND',
        message: 'User not found'
      }, 404);
    }
    
    // In a real application, you would hash the new password and update it in the database
    // For this mock implementation, we're not storing passwords
    console.log(`Password reset successful for user ${user.id}: ${newPassword}`);
    
    // Remove the used reset code
    resetCodes.delete(phone);
    
    // Return success response
    return createSuccessResponse(null, 204);
  });
}