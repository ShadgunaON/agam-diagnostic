import { IDocumentRepository } from '@/domains/document/repository';
import { DocumentMetadata, DocumentEntityType, AllowedContentType, ALLOWED_CONTENT_TYPES, MAX_FILE_SIZE_BYTES } from '@/domains/document/model';
import { Result, success, failure } from '@/shared/result';

export interface IStorageService {
  getPresignedUploadUrl(fileKey: string, contentType: string): Promise<string>;
  getPresignedDownloadUrl(fileKey: string): Promise<string>;
}

export class DocumentService {
  constructor(
    private readonly documentRepository: IDocumentRepository,
    private readonly storageService?: IStorageService
  ) {}

  async getById(documentId: string): Promise<Result<DocumentMetadata>> {
    return this.documentRepository.getById(documentId);
  }

  async getByEntity(entityType: string, entityId: string): Promise<Result<DocumentMetadata[]>> {
    return this.documentRepository.getByEntity(entityType, entityId);
  }

  /**
   * Validates upload parameters and creates a PENDING metadata record.
   * Returns the documentId and presigned upload URL.
   */
  async initiateUpload(params: {
    entityType: DocumentEntityType;
    entityId: string;
    patientId: string;
    bookingId?: string;
    fileName: string;
    contentType: AllowedContentType;
    fileSize: number;
    createdBy: string;
  }): Promise<Result<{ documentId: string; uploadUrl: string; fileKey: string }>> {
    // Validate content type
    if (!ALLOWED_CONTENT_TYPES.includes(params.contentType)) {
      return failure(new Error(`Unsupported content type: ${params.contentType}. Allowed: ${ALLOWED_CONTENT_TYPES.join(', ')}`));
    }

    // Validate file size
    if (params.fileSize > MAX_FILE_SIZE_BYTES) {
      return failure(new Error(`File size ${params.fileSize} exceeds maximum allowed ${MAX_FILE_SIZE_BYTES} bytes (10MB)`));
    }

    const documentId = `DOC-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const extension = this.getExtension(params.contentType);
    const fileKey = `documents/${params.patientId}/${params.entityType}/${params.entityId}/${documentId}.${extension}`;

    const metadata: DocumentMetadata = {
      documentId,
      entityType: params.entityType,
      entityId: params.entityId,
      patientId: params.patientId,
      bookingId: params.bookingId,
      fileKey,
      fileName: params.fileName,
      contentType: params.contentType,
      fileSize: params.fileSize,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      createdBy: params.createdBy,
    };

    const createRes = await this.documentRepository.createMetadata(metadata);
    if (!createRes.isSuccess) {
      return failure(createRes.error || new Error('Failed to create document metadata'));
    }

    if (!this.storageService) {
      return failure(new Error('Storage service not configured'));
    }

    try {
      const uploadUrl = await this.storageService.getPresignedUploadUrl(fileKey, params.contentType);
      return success({ documentId, uploadUrl, fileKey });
    } catch (err: any) {
      return failure(new Error(`Failed to generate upload URL: ${err.message}`));
    }
  }

  /**
   * Marks a PENDING document as UPLOADED after the browser confirms successful upload.
   */
  async completeUpload(documentId: string): Promise<Result<DocumentMetadata>> {
    const res = await this.documentRepository.getById(documentId);
    if (!res.isSuccess) return failure(res.error || new Error('Document not found'));

    if (res.value.status !== 'PENDING') {
      return failure(new Error(`Document ${documentId} is not in PENDING state (current: ${res.value.status})`));
    }

    return this.documentRepository.updateStatus(documentId, 'UPLOADED');
  }

  /**
   * Returns a presigned download URL for an UPLOADED document.
   * Authorization must be verified by the caller before invoking this method.
   */
  async getDownloadUrl(documentId: string): Promise<Result<{ downloadUrl: string; metadata: DocumentMetadata }>> {
    const res = await this.documentRepository.getById(documentId);
    if (!res.isSuccess) return failure(res.error || new Error('Document not found'));

    if (res.value.status !== 'UPLOADED') {
      return failure(new Error(`Document ${documentId} is not available for download (status: ${res.value.status})`));
    }

    if (!this.storageService) {
      return failure(new Error('Storage service not configured'));
    }

    try {
      const downloadUrl = await this.storageService.getPresignedDownloadUrl(res.value.fileKey);
      return success({ downloadUrl, metadata: res.value });
    } catch (err: any) {
      return failure(new Error(`Failed to generate download URL: ${err.message}`));
    }
  }

  private getExtension(contentType: string): string {
    switch (contentType) {
      case 'application/pdf': return 'pdf';
      case 'image/jpeg': return 'jpg';
      case 'image/png': return 'png';
      default: return 'bin';
    }
  }
}
