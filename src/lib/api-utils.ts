import { toast } from 'sonner';

import { ApiResponse, BackendError, hasApiErrors } from '@/types/api';

/**
 * Handle API response and show appropriate toast messages
 * Throws BackendError if response has errors
 */
export function handleApiResponse<T>(response: ApiResponse<T>): T {
  if (hasApiErrors(response)) {
    // Show error toast with the first error message
    const firstError = response.errors[0];
    if (firstError) {
      toast.error(firstError.message);
    }
    throw new BackendError(response);
  }
  return response.data;
}

/**
 * Show success toast message
 */
export function showSuccessToast(message: string): void {
  toast.success(message);
}

/**
 * Show error toast message
 */
export function showErrorToast(message: string): void {
  toast.error(message);
}

/**
 * Show info toast message
 */
export function showInfoToast(message: string): void {
  toast.info(message);
}

/**
 * Extract error message from BackendError for display
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof BackendError) {
    const firstError = error.getFirstError();
    return firstError?.message || 'An error occurred';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

/**
 * Format field errors for form display
 */
export function formatFieldErrors(
  error: BackendError,
  field: string
): string[] {
  return error.getFieldErrors(field).map((err) => err.message);
}
