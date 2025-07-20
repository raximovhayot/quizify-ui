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
import { Language } from '@/types/common';
import { UpdateProfileRequest } from '@/types/profile';

/**
 * GET /api/profile
 * Get current user's profile information
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    return withAuth(async (request: NextRequest, user: User) => {
      // Return the user's profile information
      return createSuccessResponse(user);
    })(request);
  });
}

/**
 * PUT /api/profile
 * Update current user's profile information
 */
export async function PUT(request: NextRequest) {
  return withErrorHandling(async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return withAuth(async (request: NextRequest, user: User) => {
      const body = await parseRequestBody<UpdateProfileRequest>(request);
      
      // Validate required fields
      validateRequiredFields(body, ['firstName', 'language']);
      
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { firstName, lastName, language } = body;
      
      // Validate language value
      const validLanguages = Object.values(Language);
      if (!validLanguages.includes(language)) {
        return createErrorResponse({
          code: 'INVALID_LANGUAGE',
          message: 'Invalid language value'
        }, 400);
      }
      
      // TODO: Implement backend integration for profile updates
      // This endpoint needs to be connected to a real database
      // All validation logic above should be preserved when implementing the backend
      return createErrorResponse({
        code: 'NOT_IMPLEMENTED',
        message: 'Profile update service not implemented yet. Backend integration required.'
      }, 501);
    })(request);
  });
}