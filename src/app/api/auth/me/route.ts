import { NextRequest } from 'next/server';
import { 
  createErrorResponse,
  createSuccessResponse, 
  withErrorHandling
} from '@/lib/api-utils';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

/**
 * GET /api/auth/me
 * Get current authenticated user information
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    // Extract authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return createErrorResponse({
        code: 'UNAUTHORIZED',
        message: 'Authorization header is required'
      }, 401);
    }

    try {
      // Forward request to backend
      const backendResponse = await fetch(`${BACKEND_URL}/account/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
      });

      const responseData = await backendResponse.json();

      if (!backendResponse.ok) {
        return createErrorResponse({
          code: 'USER_INFO_FAILED',
          message: responseData.message || 'Failed to get user information'
        }, backendResponse.status);
      }

      return createSuccessResponse(responseData.data);
    } catch (error) {
      console.error('Backend user info error:', error);
      return createErrorResponse({
        code: 'BACKEND_ERROR',
        message: 'Unable to connect to user service'
      }, 503);
    }
  });
}