import { NextRequest } from 'next/server';
import { 
  createSuccessResponse, 
  withErrorHandling,
  parseRequestBody
} from '@/lib/api-utils';
import { withAuth } from '@/lib/auth-middleware';
import { mockDb } from '@/lib/mock-database';
import { User } from '@/types/auth';

interface LogoutRequest {
  refreshToken?: string;
}

/**
 * POST /api/auth/logout
 * Logout user and invalidate refresh token
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return withAuth(async (request: NextRequest, _user: User) => {
      try {
        const body = await parseRequestBody<LogoutRequest>(request);
        
        // If refresh token is provided, remove it from storage
        if (body.refreshToken) {
          mockDb.deleteRefreshToken(body.refreshToken);
        }
        
        // In a real application, you might also want to:
        // 1. Add the access token to a blacklist
        // 2. Log the logout event
        // 3. Clear any user sessions
        
        // Return success response (no data needed for logout)
        return createSuccessResponse(null, 204);
      } catch {
        // If parsing body fails, still allow logout to succeed
        // This ensures logout always works even with malformed requests
        return createSuccessResponse(null, 204);
      }
    })(request);
  });
}