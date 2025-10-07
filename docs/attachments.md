### Attachments — UI ↔ Backend alignment

Updated: 2025-10-07

This document explains how the UI handles file attachments after Milestone 3.

#### Backend endpoints (source of truth)

- POST `/api/file/upload` — multipart upload (field: `file`)
- GET `/api/file/attachment-url/{attachmentId}` — returns a signed URL and metadata
- PUT `/api/file/update-expired-files-url` — admin-only (refresh expired presigned URLs)

There is no public DELETE endpoint for attachments.

#### UI service: `AttachmentService`

- `upload(file: File): Promise<AttachmentDTO>`
- `getDetails(attachmentId: number, signal?): Promise<AttachmentDTO>`
- `getUrl(attachmentId: number, signal?): Promise<string>`
- Deprecated shims (kept temporarily for compatibility):
  - `uploadAttachment(file, _token?)`
  - `getAttachment(id, _token?)`
  - `getDownloadUrl(id, _token?)`

Auth is provided automatically by `apiClient` via `TokenSyncProvider`; do not pass tokens to service methods.

#### Types & validation

- Runtime validation with Zod normalizes backend details to `AttachmentDTO` shape:
  - Picks `downloadUrl` from any of `downloadUrl | url | fileUrl`.
  - Maps `fileSize | size` to `fileSize`.
  - Fills optional metadata (`fileName`, `originalFileName`, `contentType`, `uploadDate`).
- No usage of `any`.

#### Migration checklist

- Replace any direct calls to `/instructor/attachments*` with `AttachmentService` methods above.
- Remove per-call token arguments; rely on `apiClient`.
- If you need only the URL, prefer `getUrl(id)`.

#### Examples

```ts
// Upload
const details = await AttachmentService.upload(file);
console.log(details.downloadUrl);

// Later, retrieve a fresh URL
const refreshed = await AttachmentService.getDetails(details.id);
```
