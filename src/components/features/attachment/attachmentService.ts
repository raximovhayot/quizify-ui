import { AttachmentDTO } from '@/components/features/attachment/attachment';
import { apiClient } from '@/lib/api';
import { IApiResponse, extractApiData } from '@/types/api';

// Re-export AttachmentDTO for convenience imports
export type { AttachmentDTO } from '@/components/features/attachment/attachment';

/**
 * AttachmentService - Handles file attachment operations
 *
 * This services provides methods for uploading, downloading, and managing
 * file attachments for quizzes and questions.
 */
export class AttachmentService {
  // ============================================================================
  // ATTACHMENT MANAGEMENT METHODS
  // ============================================================================

  /**
   * Upload a file attachment
   *
   * @param file - File to upload
   * @param accessToken - JWT access token for authentication
   * @returns Promise resolving to attachment information
   * @throws BackendError if upload fails or file is invalid
   */
  static async uploadAttachment(
    file: File,
    accessToken: string
  ): Promise<AttachmentDTO> {
    const formData = new FormData();
    formData.append('file', file);

    const response: IApiResponse<AttachmentDTO> = await apiClient.post(
      '/instructor/attachments',
      formData,
      { token: accessToken }
    );
    return extractApiData(response);
  }

  /**
   * Get attachment information by ID
   *
   * @param attachmentId - ID of the attachment
   * @param accessToken - JWT access token for authentication
   * @returns Promise resolving to attachment information
   * @throws BackendError if attachment not found
   */
  static async getAttachment(
    attachmentId: number,
    accessToken: string
  ): Promise<AttachmentDTO> {
    const response: IApiResponse<AttachmentDTO> = await apiClient.get(
      `/instructor/attachments/:id`,
      { token: accessToken, params: { id: attachmentId } }
    );
    return extractApiData(response);
  }

  /**
   * Delete an attachment
   *
   * @param attachmentId - ID of the attachment to delete
   * @param accessToken - JWT access token for authentication
   * @returns Promise resolving when deletion is complete
   * @throws BackendError if attachment not found or deletion fails
   */
  static async deleteAttachment(
    attachmentId: number,
    accessToken: string
  ): Promise<void> {
    const response: IApiResponse<void> = await apiClient.delete(
      `/instructor/attachments/${attachmentId}`,
      accessToken
    );
    extractApiData(response);
  }

  /**
   * Get download URL for an attachment
   *
   * @param attachmentId - ID of the attachment
   * @param accessToken - JWT access token for authentication
   * @returns Promise resolving to download URL
   * @throws BackendError if attachment not found
   */
  static async getDownloadUrl(
    attachmentId: number,
    accessToken: string
  ): Promise<string> {
    const attachment = await this.getAttachment(attachmentId, accessToken);
    return attachment.downloadUrl;
  }

  /**
   * Validate file before upload
   *
   * @param file - File to validate
   * @param maxSizeInMB - Maximum file size in MB (default: 10MB)
   * @param allowedTypes - Array of allowed MIME types (default: common document/image types)
   * @returns Validation result with error message if invalid
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
    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return {
        isValid: false,
        error: `File size must be less than ${maxSizeInMB}MB`,
      };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'File type not supported',
      };
    }

    return { isValid: true };
  }
}
