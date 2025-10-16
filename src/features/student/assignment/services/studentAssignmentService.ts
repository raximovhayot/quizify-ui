import { apiClient } from '@/lib/api';
import { IApiResponse, extractApiData } from '@/types/api';
import { IPageableList } from '@/types/common';
import { z } from 'zod';

// NOTE: Backend source of truth (as of 2025-10-07)
// - GET  /student/assignments/join?code=...
// - POST /student/assignments/join           { code }
// - GET  /student/assignments/registrations  pageable list
// These align with StudentAssignmentJoinController & StudentAssignmentRegistrationController.
// Schemas below are intentionally permissive to avoid tight coupling until OpenAPI types are wired.

// Minimal, forward-compatible shapes (will accept extra fields from backend)
const joinCheckSchema = z
  .object({
    assignmentId: z.number().optional(),
    title: z.string().optional(),
  })
  .passthrough();

const joinResponseSchema = z
  .object({
    attemptId: z.number(),
    assignmentId: z.number(),
  })
  .passthrough();

const registrationItemSchema = z
  .object({
    id: z.number().optional(),
    assignmentId: z.number().optional(),
    title: z.string().optional(),
  })
  .passthrough();

// Helper: lightweight pageable validator (falls back to raw data if shape drifts)
const pageableOf = <T extends z.ZodTypeAny>(item: T) =>
  z
    .object({
      content: z.array(item),
      page: z.number().optional(),
      size: z.number().optional(),
      totalElements: z.number().optional(),
      totalPages: z.number().optional(),
    })
    .passthrough();

export type AssignmentJoinCheck = z.infer<typeof joinCheckSchema>;
export type AssignmentJoinResponse = z.infer<typeof joinResponseSchema>;
export type AssignmentRegistrationItem = z.infer<typeof registrationItemSchema>;

/**
 * StudentAssignmentService — student-facing assignment actions (join & registrations)
 *
 * Transport details are centralized in apiClient (auth header + 401 refresh). No per-call token.
 */
export class StudentAssignmentService {
  /**
   * Check assignment by join code. Useful for UX pre-validation before joining.
   */
  static async checkByCode(
    code: string,
    signal?: AbortSignal
  ): Promise<AssignmentJoinCheck> {
    const res: IApiResponse<unknown> = await apiClient.get(
      '/student/assignments/join',
      { signal, query: { code } }
    );
    return joinCheckSchema.parse(extractApiData(res));
  }

  /**
   * Join assignment by code — creates an attempt for the current student.
   */
  static async join(code: string): Promise<AssignmentJoinResponse> {
    const res: IApiResponse<unknown> = await apiClient.post(
      '/student/assignments/join',
      { code }
    );
    return joinResponseSchema.parse(extractApiData(res));
  }

  /**
   * Get current student's assignment registrations (upcoming/scheduled items).
   */
  static async getRegistrations(
    params?: { page?: number; size?: number },
    signal?: AbortSignal
  ): Promise<IPageableList<AssignmentRegistrationItem>> {
    const res: IApiResponse<IPageableList<unknown>> = await apiClient.get(
      '/student/assignments/registrations',
      { signal, query: { page: params?.page, size: params?.size } }
    );

    // Try to parse with a permissive pageable schema; if it fails, return raw data to avoid hard crashes.
    const data = extractApiData(res);
    try {
      const parsed = pageableOf(registrationItemSchema).parse(data);
      return parsed as unknown as IPageableList<AssignmentRegistrationItem>;
    } catch {
      return data as unknown as IPageableList<AssignmentRegistrationItem>;
    }
  }
}
