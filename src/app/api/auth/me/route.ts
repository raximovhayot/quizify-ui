import { NextRequest } from 'next/server';
import { 
  createSuccessResponse, 
  withErrorHandling
} from '@/lib/api-utils';
import { withAuth } from '@/lib/auth-middleware';
import { User } from '@/types/auth';

/**
 * GET /api/auth/me
 * Get current authenticated user information
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    return withAuth(async (request: NextRequest, user: User) => {
      // Return the authenticated user's information
      return createSuccessResponse(user);
    })(request);
  });
}