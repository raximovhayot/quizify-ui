import { NextRequest } from 'next/server';
import { User, UserRole } from '@/types/auth';
import { AuthenticationError, AuthorizationError } from './api-utils';

// Mock JWT implementation - in production, use proper JWT library and secret

/**
 * JWT payload interface
 */
interface JWTPayload {
  userId: string;
  phone: string;
  roles: UserRole[];
  iat: number;
  exp: number;
}

/**
 * Mock JWT implementation for development
 * In production, use a proper JWT library like 'jsonwebtoken'
 */
class MockJWT {
  static sign(payload: Omit<JWTPayload, 'iat' | 'exp'>, expiresIn: string = '1h'): string {
    const now = Math.floor(Date.now() / 1000);
    const expiration = now + (expiresIn === '1h' ? 3600 : expiresIn === '7d' ? 604800 : 3600);
    
    const fullPayload: JWTPayload = {
      ...payload,
      iat: now,
      exp: expiration
    };
    
    // Simple base64 encoding for mock purposes
    return Buffer.from(JSON.stringify(fullPayload)).toString('base64');
  }
  
  static verify(token: string): JWTPayload {
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      const now = Math.floor(Date.now() / 1000);
      
      if (decoded.exp < now) {
        throw new Error('Token expired');
      }
      
      return decoded as JWTPayload;
    } catch {
      throw new Error('Invalid token');
    }
  }
}

/**
 * Extract bearer token from Authorization header
 */
function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7);
}

/**
 * Authenticate user from request
 */
export async function authenticateUser(request: NextRequest): Promise<User> {
  const token = extractBearerToken(request);
  
  if (!token) {
    throw new AuthenticationError('No authentication token provided');
  }
  
  try {
    const payload = MockJWT.verify(token);
    
    // In a real application, you would fetch the user from the database
    // For now, we'll construct the user from the JWT payload
    const user: User = {
      id: payload.userId,
      phone: payload.phone,
      firstName: 'Mock', // These would come from database
      lastName: 'User',
      roles: payload.roles,
      state: 1, // UserState.ACTIVE
      language: 0 // Language.EN
    };
    
    return user;
  } catch {
    throw new AuthenticationError('Invalid or expired token');
  }
}

/**
 * Check if user has required role
 */
export function requireRole(user: User, requiredRole: UserRole): void {
  if (!user.roles.includes(requiredRole)) {
    throw new AuthorizationError(`${UserRole[requiredRole]} role required`);
  }
}

/**
 * Check if user has any of the required roles
 */
export function requireAnyRole(user: User, requiredRoles: UserRole[]): void {
  const hasRole = requiredRoles.some(role => user.roles.includes(role));
  
  if (!hasRole) {
    const roleNames = requiredRoles.map(role => UserRole[role]).join(' or ');
    throw new AuthorizationError(`One of the following roles required: ${roleNames}`);
  }
}

/**
 * Generate access token
 */
export function generateAccessToken(user: User): string {
  return MockJWT.sign({
    userId: user.id,
    phone: user.phone,
    roles: user.roles
  }, '1h');
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(user: User): string {
  return MockJWT.sign({
    userId: user.id,
    phone: user.phone,
    roles: user.roles
  }, '7d');
}

/**
 * Verify refresh token and return user data
 */
export function verifyRefreshToken(token: string): { userId: string; phone: string; roles: UserRole[] } {
  try {
    const payload = MockJWT.verify(token);
    return {
      userId: payload.userId,
      phone: payload.phone,
      roles: payload.roles
    };
  } catch {
    throw new AuthenticationError('Invalid or expired refresh token');
  }
}

/**
 * Higher-order function to protect API routes with authentication
 */
export function withAuth<T>(
  handler: (request: NextRequest, user: User, ...args: T[]) => Promise<Response>
) {
  return async (request: NextRequest, ...args: T[]): Promise<Response> => {
    try {
      const user = await authenticateUser(request);
      return handler(request, user, ...args);
    } catch (error) {
      if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
        throw error;
      }
      throw new AuthenticationError('Authentication failed');
    }
  };
}

/**
 * Higher-order function to protect API routes with role-based authorization
 */
export function withRole<T>(
  requiredRole: UserRole,
  handler: (request: NextRequest, user: User, ...args: T[]) => Promise<Response>
) {
  return withAuth<T>(async (request: NextRequest, user: User, ...args: T[]) => {
    requireRole(user, requiredRole);
    return handler(request, user, ...args);
  });
}

/**
 * Higher-order function to protect API routes with multiple role options
 */
export function withAnyRole<T>(
  requiredRoles: UserRole[],
  handler: (request: NextRequest, user: User, ...args: T[]) => Promise<Response>
) {
  return withAuth<T>(async (request: NextRequest, user: User, ...args: T[]) => {
    requireAnyRole(user, requiredRoles);
    return handler(request, user, ...args);
  });
}