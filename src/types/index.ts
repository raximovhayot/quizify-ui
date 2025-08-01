/**
 * Centralized type definitions and exports
 * 
 * This file serves as the main entry point for all type definitions used throughout
 * the Quizify UI application. It provides a single source of truth for types and
 * ensures consistent type usage across the codebase.
 * 
 * @fileoverview Main types barrel export file
 * @version 1.0.0
 * @since 2025-01-01
 * 
 * @example
 * ```typescript
 * // Import commonly used types
 * import { ApiResponse, UserId, AuthState } from '@/types';
 * 
 * // Use branded types for type safety
 * const userId = createUserId('user-123');
 * 
 * // Use discriminated unions for state management
 * const authState: AuthState = {
 *   status: 'authenticated',
 *   user: { id: userId, phone: createPhoneNumber('+998901234567') }
 * };
 * ```
 */

// =============================================================================
// CORE API TYPES
// =============================================================================

/**
 * Core API response and error handling types
 * Used for standardized communication with the backend
 */
export * from './api';
export * from './api-endpoints';

// =============================================================================
// COMMON TYPES
// =============================================================================

/**
 * Common types used across the application
 * Includes enums, interfaces, and utility types for shared concepts
 */
export * from './common';

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Advanced utility types for enhanced type safety
 * Includes branded types, discriminated unions, and helper types
 */
export * from './utils';
