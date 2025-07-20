import { NextRequest } from 'next/server';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  withErrorHandling,
  parseRequestBody,
  validateRequiredFields
} from '@/lib/api-utils';
import { withAuth } from '@/lib/auth-middleware';
import { mockDb } from '@/lib/mock-database';
import { User } from '@/types/auth';
import { Language } from '@/types/common';

interface UpdateProfileRequest {
  firstName: string;
  lastName?: string;
  language: Language;
}

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
    return withAuth(async (request: NextRequest, user: User) => {
      const body = await parseRequestBody<UpdateProfileRequest>(request);
      
      // Validate required fields
      validateRequiredFields(body, ['firstName', 'language']);
      
      const { firstName, lastName, language } = body;
      
      // Validate language value
      const validLanguages = Object.values(Language);
      if (!validLanguages.includes(language)) {
        return createErrorResponse({
          code: 'INVALID_LANGUAGE',
          message: 'Invalid language value'
        }, 400);
      }
      
      // Update user profile
      const updatedUser = mockDb.updateUser(user.id, {
        firstName,
        lastName: lastName || '',
        language
      });
      
      if (!updatedUser) {
        return createErrorResponse({
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }, 404);
      }
      
      return createSuccessResponse(updatedUser);
    })(request);
  });
}