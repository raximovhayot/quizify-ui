import { NextRequest } from 'next/server';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  withErrorHandling,
  parseRequestBody,
  validateRequiredFields
} from '@/lib/api-utils';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth-middleware';
import { mockDb } from '@/lib/mock-database';
import { LoginRequest, LoginResponse } from '@/lib/auth-service';

/**
 * POST /api/auth/login
 * Authenticate user with phone and password
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await parseRequestBody<LoginRequest>(request);
    
    // Validate required fields
    validateRequiredFields(body, ['phone', 'password']);
    
    const { phone, password } = body;
    
    // Find user by phone
    const user = mockDb.getUserByPhone(phone);
    if (!user) {
      return createErrorResponse({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid phone number or password'
      }, 401);
    }
    
    // In a real application, you would hash and compare passwords
    // For this mock implementation, we'll use a simple password check
    const mockPassword = 'password123'; // Mock password for all users
    if (password !== mockPassword) {
      return createErrorResponse({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid phone number or password'
      }, 401);
    }
    
    // Check if user account is active
    if (user.state !== 1) { // UserState.ACTIVE
      return createErrorResponse({
        code: 'ACCOUNT_INACTIVE',
        message: 'Account is not active'
      }, 403);
    }
    
    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Store refresh token
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days
    mockDb.storeRefreshToken(refreshToken, user.id, refreshTokenExpiry);
    
    const response: LoginResponse = {
      user,
      accessToken,
      refreshToken
    };
    
    return createSuccessResponse(response);
  });
}