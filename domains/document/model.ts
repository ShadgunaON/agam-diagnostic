export type DocumentStatus = 'PENDING' | 'UPLOADED' | 'REPLACED' | 'DELETED';

export type DocumentEntityType = 'REPORT' | 'INVOICE' | 'PRESCRIPTION' | 'PATIENT_ATTACHMENT';

export const ALLOWED_CONTENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
] as const;

export type AllowedContentType = typeof ALLOWED_CONTENT_TYPES[number];

/** Maximum file size in bytes: 10 MB */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export interface DocumentMetadata {
  documentId: string;
  entityType: DocumentEntityType;
  entityId: string;
  patientId: string;
  bookingId?: string;
  fileKey: string;
  fileName: string;
  contentType: AllowedContentType;
  fileSize: number;
  status: DocumentStatus;
  createdAt: string;
  createdBy: string;
}
