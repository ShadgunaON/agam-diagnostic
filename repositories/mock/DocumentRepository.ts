import { IDocumentRepository } from '@/domains/document/repository';
import { DocumentMetadata } from '@/domains/document/model';
import { Result, success, failure } from '@/shared/result';
import { SharedMockAdapter } from '@/lib/storage/SharedMockAdapter';

export class MockDocumentRepository implements IDocumentRepository {
  private adapter: SharedMockAdapter<DocumentMetadata[]>;

  constructor() {
    this.adapter = new SharedMockAdapter<DocumentMetadata[]>('agam_documents');
  }

  private async getDocs(): Promise<DocumentMetadata[]> {
    const loaded = await this.adapter.load();
    return loaded || [];
  }

  private async saveDocs(docs: DocumentMetadata[]): Promise<void> {
    await this.adapter.save(docs);
  }

  async createMetadata(doc: DocumentMetadata): Promise<Result<DocumentMetadata>> {
    const docs = await this.getDocs();
    docs.push(doc);
    await this.saveDocs(docs);
    return success(doc);
  }

  async getById(documentId: string): Promise<Result<DocumentMetadata>> {
    const docs = await this.getDocs();
    const found = docs.find(d => d.documentId === documentId);
    if (!found) return failure(new Error(`Document not found: ${documentId}`));
    return success(found);
  }

  async getByEntity(entityType: string, entityId: string): Promise<Result<DocumentMetadata[]>> {
    const docs = await this.getDocs();
    const filtered = docs.filter(d => d.entityType === entityType && d.entityId === entityId);
    return success(filtered);
  }

  async updateStatus(documentId: string, status: DocumentMetadata['status']): Promise<Result<DocumentMetadata>> {
    const docs = await this.getDocs();
    const idx = docs.findIndex(d => d.documentId === documentId);
    if (idx === -1) return failure(new Error(`Document not found: ${documentId}`));
    docs[idx].status = status;
    await this.saveDocs(docs);
    return success(docs[idx]);
  }
}
