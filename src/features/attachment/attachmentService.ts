import { z } from 'zod';

import { AttachmentDTO } from '@/features/attachment/attachment';
export type { AttachmentDTO } from '@/features/attachment/attachment';
import { apiClient } from '@/lib/api';
import { IApiResponse, extractApiData } from '@/types/api';

/**
 * AttachmentService - Handles file attachment operations
 *
 * Realigned to backend endpoints under /api/file (AttachmentController).
 * - POST /api/file/upload (multipart)
 * - GET  /api/file/attachment-url/:attachmentId
 *
 * Notes:
 * - No per-call token parameter; auth is handled by apiClient + TokenSyncProvider.
 * - Returns strictly-typed objects (no `any`).
 */
export class AttachmentService {
  // ============================================================================
  // TYPES & SCHEMAS
  // ============================================================================
  private static backendDetailsSchema = z
    .object({
      id: z.number().int().positive(),
      // Possible URL field names from backend mappers
      url: z.string().url().optional(),
      fileUrl: z.string().url().optional(),
      downloadUrl: z.string().url().optional(),
      // Metadata (forward-compatible)
      fileName: z.string().optional(),
      originalFileName: z.string().optional(),
      contentType: z.string().optional(),
      size: z.number().int().nonnegative().optional(),
      fileSize: z.number().int().nonnegative().optional(),
      uploadDate: z.string().optional(),
    })
    .passthrough();

  // Normalize backend details to the existing AttachmentDTO shape
  private static toAttachmentDTO(raw: unknown): AttachmentDTO {
    const parsed = this.backendDetailsSchema.parse(raw);

    const downloadUrl = parsed.downloadUrl ?? parsed.url ?? parsed.fileUrl ?? '';
    if (!downloadUrl) {
      throw new Error('Attachment URL is missing in server response');
    }

    return {
      id: parsed.id,
      fileName: parsed.fileName ?? parsed.originalFileName ?? 'file',
      originalFileName: parsed.originalFileName ?? parsed.fileName ?? 'file',
      fileSize: parsed.fileSize ?? parsed.size ?? 0,
      contentType: parsed.contentType ?? 'application/octet-stream',
      uploadDate: parsed.uploadDate ?? new Date().toISOString(),
      downloadUrl,
    } satisfies AttachmentDTO;
  }

  // ============================================================================
  // ATTACHMENT MANAGEMENT METHODS
  // ============================================================================

  /**
   * Upload a file attachment (multipart)
   *
   * @param file - File to upload
   * @returns AttachmentDTO with signed URL and metadata (when provided)
   */
  static async upload(file: File): Promise<AttachmentDTO> {
    const formData = new FormData();
    formData.append('file', file);

    const response: IApiResponse<unknown> = await apiClient.post(
      '/api/file/upload',
      formData
    );
    const data = extractApiData(response);
    return this.toAttachmentDTO(data);
  }

  /**
   * Get attachment details (includes a signed URL)
   */
  static async getDetails(
    attachmentId: number,
    signal?: AbortSignal
  ): Promise<AttachmentDTO> {
    const response: IApiResponse<unknown> = await apiClient.get(
      '/api/file/attachment-url/:attachmentId',
      { params: { attachmentId }, signal }
    );
    const data = extractApiData(response);
    return this.toAttachmentDTO(data);
  }

  /**
   * Convenience: get only the signed download URL
   */
  static async getUrl(
    attachmentId: number,
    signal?: AbortSignal
  ): Promise<string> {
    const details = await this.getDetails(attachmentId, signal);
    return details.downloadUrl;
  }

  // ============================================================================
  // BACKWARD-COMPATIBILITY SHIMS (deprecated)
  // ============================================================================
  /** @deprecated Use `upload(file)` — token is handled globally */
  static async uploadAttachment(file: File, _accessToken?: string) {
    return this.upload(file);
  }
  /** @deprecated Use `getDetails(id)` — token is handled globally */
  static async getAttachment(attachmentId: number, _accessToken?: string) {
    return this.getDetails(attachmentId);
  }
  /** @deprecated Use `getUrl(id)` — token is handled globally */
  static async getDownloadUrl(attachmentId: number, _accessToken?: string) {
    return this.getUrl(attachmentId);
  }

  /**
   * Validate file before upload
   */
  static validateFile(
    file: File,
    maxSizeInMB: number = 10,
    allowedTypes: string[] = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
    ]
  ): { isValid: boolean; error?: string } {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return {
        isValid: false,
        error: `File size must be less than ${maxSizeInMB}MB`,
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'File type not supported',
      };
    }

    return { isValid: true };
  }
}
