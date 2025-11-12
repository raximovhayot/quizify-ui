import { toast } from 'sonner';
import { AxiosError } from 'axios';

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    // Handle Axios errors
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
      return error.response.data.errors[0]?.message || 'An error occurred';
    }
    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
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
 * Handle API errors and show toast
 */
export function handleApiError(error: unknown): void {
  const message = getErrorMessage(error);
  showErrorToast(message);
}
