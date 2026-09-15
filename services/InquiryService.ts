import { Result, success, failure } from '@/shared/result';

export interface Inquiry {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
  status: 'New' | 'Read' | 'Resolved';
  createdAt: string;
  updatedAt?: string;
}

export interface InquiryConnection {
  items: Inquiry[];
  nextCursor: string | null;
}

export interface AdminInquiriesParams {
  limit?: number;
  cursor?: string | null;
  status?: string | null;
  search?: string | null;
}

export class InquiryService {
  private async _graphqlFetch<T>(
    query: string,
    variables?: Record<string, unknown>
  ): Promise<T | null> {
    try {
      const token =
        typeof window !== 'undefined'
          ? sessionStorage.getItem('cognito_id_token') ||
            localStorage.getItem('cognito_id_token') ||
            ''
          : '';

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query, variables }),
        cache: 'no-store',
      });

      if (!response.ok) return null;
      const { data, errors } = await response.json();
      if (errors?.length) {
        console.error('GraphQL errors:', errors);
        return null;
      }
      return data as T;
    } catch (err) {
      console.error('InquiryService fetch failed:', err);
      return null;
    }
  }

  async getAdminInquiries(
    params: AdminInquiriesParams = {}
  ): Promise<Result<InquiryConnection>> {
    const { limit = 50, cursor = null, status = null, search = null } = params;
    const data = await this._graphqlFetch<{
      adminInquiries: InquiryConnection;
    }>(
      `query AdminInquiries($limit: Int, $cursor: String, $status: String, $search: String) {
        adminInquiries(limit: $limit, cursor: $cursor, status: $status, search: $search) {
          items {
            id firstName lastName email phone message status createdAt updatedAt
          }
          nextCursor
        }
      }`,
      { limit, cursor, status, search }
    );

    if (data?.adminInquiries) return success(data.adminInquiries);
    return failure(new Error('Failed to fetch inquiries'));
  }

  async getInquiryById(id: string): Promise<Result<Inquiry>> {
    // We use the list and filter by id since we don't have a separate getById query
    // (The detail page will pass the full object via router state or re-query)
    const data = await this.getAdminInquiries({ limit: 200 });
    if (data.isFailure) return failure(data.error);
    const inquiry = data.value.items.find((i) => i.id === id);
    if (!inquiry) return failure(new Error('Inquiry not found'));
    return success(inquiry);
  }

  async updateInquiryStatus(
    id: string,
    status: string
  ): Promise<Result<boolean>> {
    const data = await this._graphqlFetch<{ updateInquiryStatus: boolean }>(
      `mutation UpdateInquiryStatus($id: ID!, $status: String!) {
        updateInquiryStatus(id: $id, status: $status)
      }`,
      { id, status }
    );
    if (data?.updateInquiryStatus) return success(true);
    return failure(new Error('Failed to update inquiry status'));
  }
}
