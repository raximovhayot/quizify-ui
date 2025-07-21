import { NextRequest } from 'next/server';
import { 
  createErrorResponse, 
  createSuccessResponse,
  withErrorHandling,
  parseRequestBody,
  validateRequiredFields
} from '@/lib/api-utils';
import { LoginRequest } from '@/types/auth';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

/**
 * POST /api/auth/login
 * Authenticate user with phone and password
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await parseRequestBody<LoginRequest>(request);
    
    // Validate required fields
    validateRequiredFields(body, ['phone', 'password']);
    
    try {
      // Forward request to backend
      const backendResponse = await fetch(`${BACKEND_URL}/auth/sign-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const responseData = await backendResponse.json();

      if (!backendResponse.ok) {
        return createErrorResponse({
          code: 'AUTHENTICATION_FAILED',
          message: responseData.message || 'Authentication failed'
        }, backendResponse.status);
      }

      return createSuccessResponse(responseData.data);
    } catch (error) {
      console.error('Backend authentication error:', error);
      return createErrorResponse({
        code: 'BACKEND_ERROR',
        message: 'Unable to connect to authentication service'
      }, 503);
    }
  });
}