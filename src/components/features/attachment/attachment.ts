/**
 * Attachment response DTO
 */
export interface AttachmentDTO {
  id: number;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  contentType: string;
  uploadDate: string;
  downloadUrl: string;
}
