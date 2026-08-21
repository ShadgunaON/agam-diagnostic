import { IDocumentRepository } from '@/domains/document/repository';
import { DocumentMetadata } from '@/domains/document/model';
import { Result } from '@/shared/result';
import { IApiClient } from '@/lib/api/client';
import { toResult } from '@/lib/api/utils';

export class ApiDocumentRepository implements IDocumentRepository {
  constructor(private readonly apiClient: IApiClient) {}

  async createMetadata(doc: DocumentMetadata): Promise<Result<DocumentMetadata>> {
    return toResult(this.apiClient.post<DocumentMetadata>('/api/documents', doc));
  }

  async getById(documentId: string): Promise<Result<DocumentMetadata>> {
    return toResult(this.apiClient.get<DocumentMetadata>(`/api/documents/${documentId}`));
  }

  async getByEntity(entityType: string, entityId: string): Promise<Result<DocumentMetadata[]>> {
    return toResult(this.apiClient.get<DocumentMetadata[]>(`/api/documents?entityType=${entityType}&entityId=${entityId}`));
  }

  async updateStatus(documentId: string, status: DocumentMetadata['status']): Promise<Result<DocumentMetadata>> {
    return toResult(this.apiClient.put<DocumentMetadata>(`/api/documents/${documentId}/status`, { status }));
  }

  /**
   * Initiate a document upload: creates PENDING metadata and returns a presigned PUT URL.
   */
  async initiateUpload(params: {
    entityType: string;
    entityId: string;
    patientId: string;
    bookingId?: string;
    fileName: string;
    contentType: string;
    fileSize: number;
  }): Promise<Result<{ documentId: string; uploadUrl: string; fileKey: string }>> {
    return toResult(
      this.apiClient.post<{ documentId: string; uploadUrl: string; fileKey: string }>(
        '/api/documents/upload-url',
        params
      )
    );
  }

  /**
   * Confirm that the upload was successful.
   */
  async completeUpload(documentId: string): Promise<Result<DocumentMetadata>> {
    return toResult(
      this.apiClient.post<DocumentMetadata>(`/api/documents/${documentId}/complete`, {})
    );
  }

  /**
   * Get a short-lived presigned download URL for an UPLOADED document.
   */
  async getDownloadUrl(documentId: string): Promise<Result<{ downloadUrl: string; metadata: DocumentMetadata }>> {
    return toResult(
      this.apiClient.get<{ downloadUrl: string; metadata: DocumentMetadata }>(
        `/api/documents/${documentId}/download-url`
      )
    );
  }
}
