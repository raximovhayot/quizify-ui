import { NextRequest } from 'next/server';
import { 
  createErrorResponse, 
  createSuccessResponse,
  withErrorHandling,
  parseRequestBody,
  validateRequiredFields
} from '@/lib/api-utils';
import { RefreshTokenRequest } from '@/types/auth';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await parseRequestBody<RefreshTokenRequest>(request);
    
    // Validate required fields
    validateRequiredFields(body, ['refreshToken']);
    
    try {
      // Forward request to backend
      const backendResponse = await fetch(`${BACKEND_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const responseData = await backendResponse.json();

      if (!backendResponse.ok) {
        return createErrorResponse({
          code: 'TOKEN_REFRESH_FAILED',
          message: responseData.message || 'Token refresh failed'
        }, backendResponse.status);
      }

      return createSuccessResponse(responseData.data);
    } catch (error) {
      console.error('Backend token refresh error:', error);
      return createErrorResponse({
        code: 'BACKEND_ERROR',
        message: 'Unable to connect to authentication service'
      }, 503);
    }
  });
}