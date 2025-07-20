import { NextRequest } from 'next/server';
import { 
  createSuccessResponse, 
  withErrorHandling,
  parseRequestBody,
  validateRequiredFields
} from '@/lib/api-utils';
import { mockDb } from '@/lib/mock-database';

interface ForgotPasswordRequest {
  phone: string;
}

// Mock storage for password reset codes
const resetCodes = new Map<string, { code: string; expiresAt: Date; userId: string }>();

/**
 * POST /api/auth/forgot-password
 * Request password reset by sending verification code to phone
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await parseRequestBody<ForgotPasswordRequest>(request);
    
    // Validate required fields
    validateRequiredFields(body, ['phone']);
    
    const { phone } = body;
    
    // Find user by phone
    const user = mockDb.getUserByPhone(phone);
    if (!user) {
      // For security, don't reveal if user exists or not
      // Always return success to prevent phone number enumeration
      return createSuccessResponse(null, 204);
    }
    
    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration time (15 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);
    
    // Store the reset code
    resetCodes.set(phone, {
      code,
      expiresAt,
      userId: user.id
    });
    
    // In a real application, you would send the code via SMS
    // For this mock implementation, we'll just log it
    console.log(`Password reset code for ${phone}: ${code}`);
    
    // Always return success (don't reveal if user exists)
    return createSuccessResponse(null, 204);
  });
}

// Export the reset codes map for use in reset-password endpoint
export { resetCodes };