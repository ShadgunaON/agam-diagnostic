import { DocumentMetadata, DocumentEntityType, AllowedContentType, ALLOWED_CONTENT_TYPES, MAX_FILE_SIZE_BYTES } from '@/domains/document/model';
import { Result, success, failure } from '@/shared/result';

export class DocumentService {
  constructor() {}

  private async _graphqlFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T | null> {
    try {
      const token = typeof window !== 'undefined'
        ? (sessionStorage.getItem('cognito_id_token') || localStorage.getItem('cognito_id_token') || '')
        : '';
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query, variables }),
      });
      if (!response.ok) return null;
      const { data, errors } = await response.json();
      if (errors?.length) { console.error('GraphQL errors:', errors); return null; }
      return data as T;
    } catch (err) {
      console.error('GraphQL fetch failed:', err);
      return null;
    }
  }

  async getById(documentId: string): Promise<Result<DocumentMetadata>> {
    const data = await this._graphqlFetch<{ documentById: DocumentMetadata }>(
      `query DocumentById($id: ID!) {
        documentById(id: $id) {
          documentId entityType entityId patientId bookingId
          fileKey fileName contentType fileSize status createdAt createdBy
        }
      }`,
      { id: documentId }
    );
    if (data?.documentById) return success(data.documentById);
    return failure(new Error('Document not found'));
  }

  async getByEntity(entityType: string, entityId: string): Promise<Result<DocumentMetadata[]>> {
    const data = await this._graphqlFetch<{ documents: DocumentMetadata[] }>(
      `query Documents($entityType: String, $entityId: ID) {
        documents(entityType: $entityType, entityId: $entityId) {
          documentId entityType entityId patientId bookingId
          fileKey fileName contentType fileSize status createdAt createdBy
        }
      }`,
      { entityType, entityId }
    );
    if (data?.documents) return success(data.documents);
    return failure(new Error('Failed to load documents'));
  }

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
    const data = await this._graphqlFetch<{ initiateDocumentUpload: { documentId: string; uploadUrl: string; fileKey: string } }>(
      `mutation InitiateDocumentUpload($input: AWSJSON!) {
        initiateDocumentUpload(input: $input) {
          documentId uploadUrl fileKey
        }
      }`,
      { input: params }
    );
    if (data?.initiateDocumentUpload) return success(data.initiateDocumentUpload);
    return failure(new Error('Failed to initiate document upload'));
  }

  async completeUpload(documentId: string): Promise<Result<DocumentMetadata>> {
    const data = await this._graphqlFetch<{ completeDocumentUpload: DocumentMetadata }>(
      `mutation CompleteDocumentUpload($id: ID!) {
        completeDocumentUpload(id: $id) {
          documentId status
        }
      }`,
      { id: documentId }
    );
    if (data?.completeDocumentUpload) return success(data.completeDocumentUpload);
    return failure(new Error('Failed to complete document upload'));
  }

  async getDownloadUrl(documentId: string): Promise<Result<{ downloadUrl: string; metadata: DocumentMetadata }>> {
    const data = await this._graphqlFetch<{ documentDownloadUrl: { downloadUrl: string; metadata: DocumentMetadata } }>(
      `query DocumentDownloadUrl($id: ID!) {
        documentDownloadUrl(id: $id) {
          downloadUrl
          metadata {
            documentId entityType entityId patientId bookingId
            fileKey fileName contentType fileSize status createdAt createdBy
          }
        }
      }`,
      { id: documentId }
    );
    if (data?.documentDownloadUrl) return success(data.documentDownloadUrl);
    return failure(new Error('Failed to generate download URL'));
  }
}
