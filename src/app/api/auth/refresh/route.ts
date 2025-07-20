import { NextRequest } from 'next/server';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  withErrorHandling,
  parseRequestBody,
  validateRequiredFields
} from '@/lib/api-utils';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/lib/auth-middleware';
import { mockDb } from '@/lib/mock-database';
import { RefreshTokenResponse } from '@/lib/auth-service';

interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await parseRequestBody<RefreshTokenRequest>(request);
    
    // Validate required fields
    validateRequiredFields(body, ['refreshToken']);
    
    const { refreshToken } = body;
    
    // Verify refresh token
    let tokenData;
    try {
      tokenData = verifyRefreshToken(refreshToken);
    } catch {
      return createErrorResponse({
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Invalid or expired refresh token'
      }, 401);
    }
    
    // Check if refresh token exists in database
    const storedToken = mockDb.getRefreshToken(refreshToken);
    if (!storedToken || storedToken.userId !== tokenData.userId) {
      return createErrorResponse({
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Invalid or expired refresh token'
      }, 401);
    }
    
    // Get user from database
    const user = mockDb.getUserById(tokenData.userId);
    if (!user) {
      return createErrorResponse({
        code: 'USER_NOT_FOUND',
        message: 'User not found'
      }, 404);
    }
    
    // Check if user account is still active
    if (user.state !== 1) { // UserState.ACTIVE
      return createErrorResponse({
        code: 'ACCOUNT_INACTIVE',
        message: 'Account is not active'
      }, 403);
    }
    
    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    
    // Remove old refresh token and store new one
    mockDb.deleteRefreshToken(refreshToken);
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days
    mockDb.storeRefreshToken(newRefreshToken, user.id, refreshTokenExpiry);
    
    const response: RefreshTokenResponse = {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
    
    return createSuccessResponse(response);
  });
}