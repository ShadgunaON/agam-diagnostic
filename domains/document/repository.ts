import { Result } from '@/shared/result';
import { DocumentMetadata } from './model';

export interface IDocumentRepository {
  createMetadata(doc: DocumentMetadata): Promise<Result<DocumentMetadata>>;
  getById(documentId: string): Promise<Result<DocumentMetadata>>;
  getByEntity(entityType: string, entityId: string): Promise<Result<DocumentMetadata[]>>;
  updateStatus(documentId: string, status: DocumentMetadata['status']): Promise<Result<DocumentMetadata>>;
}
