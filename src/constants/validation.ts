/**
 * Validation constants and regex patterns
 * Centralized location for reusable validation patterns across the application
 */

/**
 * Phone number validation regex for Uzbekistan
 * Supports formats: +998XXXXXXXXX, 998XXXXXXXXX, 0XXXXXXXXX
 * Used in: sign-in, forgot-password forms
 */
export const PHONE_REGEX = /^(?:\+?998|0)?\d{9}$/;

/**
 * Password validation regex
 * Requires: at least one lowercase, one uppercase, one digit, and one symbol
 */
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/;

/**
 * Password minimum length requirement
 */
export const PASSWORD_MIN_LENGTH = 8;
