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
import { LoginResponse } from '@/lib/auth-service';
import { UserRole, UserState } from '@/types/auth';
import { Language } from '@/types/common';

interface RegisterRequest {
  phone: string;
  password: string;
  firstName: string;
  lastName?: string;
}

/**
 * POST /api/auth/register
 * Register a new user account
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await parseRequestBody<RegisterRequest>(request);
    
    // Validate required fields
    validateRequiredFields(body, ['phone', 'password', 'firstName']);
    
    const { phone, password, firstName, lastName } = body;
    
    // Check if user already exists
    const existingUser = mockDb.getUserByPhone(phone);
    if (existingUser) {
      return createErrorResponse({
        code: 'USER_EXISTS',
        message: 'User with this phone number already exists'
      }, 409);
    }
    
    // Validate phone number format (basic validation)
    const phoneRegex = /^\+998\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return createErrorResponse({
        code: 'INVALID_PHONE',
        message: 'Phone number must be in format +998XXXXXXXXX'
      }, 400);
    }
    
    // Validate password strength (basic validation)
    if (password.length < 6) {
      return createErrorResponse({
        code: 'WEAK_PASSWORD',
        message: 'Password must be at least 6 characters long'
      }, 400);
    }
    
    // Create new user
    const newUser = mockDb.createUser({
      phone,
      firstName,
      lastName: lastName || '',
      roles: [UserRole.STUDENT], // Default role is student
      state: UserState.ACTIVE,
      language: Language.EN
    });
    
    // In a real application, you would hash the password before storing
    // For this mock implementation, we're not storing passwords
    
    // Generate tokens
    const accessToken = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);
    
    // Store refresh token
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7); // 7 days
    mockDb.storeRefreshToken(refreshToken, newUser.id, refreshTokenExpiry);
    
    const response: LoginResponse = {
      user: newUser,
      accessToken,
      refreshToken
    };
    
    return createSuccessResponse(response, 201);
  });
}