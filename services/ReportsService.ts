import { ReportTaskModel } from '@/domains/reports/model';
import { success, failure, Result } from '@/shared/result';

export class ReportsService {
  private bookingService?: import('./BookingService').BookingService;

  constructor() {}

  setBookingService(service: import('./BookingService').BookingService) {
    this.bookingService = service;
  }

  private async _graphqlFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T | null> {
    try {
      const token = typeof window !== 'undefined'
        ? (sessionStorage.getItem('cognito_id_token') || localStorage.getItem('cognito_id_token') || '')
        : '';
      const _url = typeof window === 'undefined'
        ? (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000') + '/api/graphql'
        : '/api/graphql';
      const response = await fetch(_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query, variables }),
        cache: 'no-store',
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const { data, errors } = await response.json();
      if (errors?.length) {
        console.error('[ReportsService] GraphQL errors:', errors);
        throw new Error(errors[0].message);
      }
      return data as T;
    } catch (err) {
      console.error('[ReportsService] fetch failed:', err);
      throw err;
    }
  }

  async getById(id: string): Promise<Result<ReportTaskModel>> {
    const data = await this._graphqlFetch<{ reportById: ReportTaskModel }>(
      `query ReportById($id: ID!) {
        reportById(id: $id) {
          id patientId bookingId testType status createdAt
          documentId submittedAt publishedAt
          patient { name id }
        }
      }`,
      { id }
    );
    if (data?.reportById) return success(data.reportById);
    return failure(new Error('Report not found'));
  }

  async getAdminWorkspace(limit = 20, cursor: string | null = null, status = 'All', sort = 'date_newest', search = '') {
    try {
      const data = await this._graphqlFetch<{ adminReportsWorkspace: any }>(
        `query GetReportsWorkspace($limit: Int, $cursor: String, $status: String, $sort: String, $search: String) {
          adminReportsWorkspace(limit: $limit, cursor: $cursor, status: $status, sort: $sort, search: $search) {
            queue {
              id status createdAt testType
              documentId submittedAt publishedAt
              bookingId
              patient { name id }
            }
            nextCursor
            pendingCount
          }
        }`,

        { limit, cursor, status, sort, search }
      );
      if (data?.adminReportsWorkspace) return success(data.adminReportsWorkspace);
      return failure(new Error('Failed to load reports workspace'));
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Unknown error'));
    }
  }

  async getByPatientId(patientId: string): Promise<Result<ReportTaskModel[]>> {
    const data = await this._graphqlFetch<{ reportsByPatient: ReportTaskModel[] }>(
      `query ReportsByPatient($patientId: ID!) {
        reportsByPatient(patientId: $patientId) {
          id patientId bookingId testType status createdAt
          documentId submittedAt publishedAt
          patient { name id }
        }
      }`,
      { patientId }
    );
    if (data?.reportsByPatient) return success(data.reportsByPatient);
    return failure(new Error('Failed to load reports for patient'));
  }

  /**
   * Creates a new Report in 'Pending Upload' status for a given booking.
   * Before calling, the caller should check whether a report already exists
   * for this bookingId to avoid duplicates.
   */
  async createForBooking(
    bookingId: string,
    patientId: string,
    testType: string,
    patientName: string
  ): Promise<Result<ReportTaskModel>> {
    const reportInput = {
      bookingId,
      patientId,
      testType,
      status: 'Pending Upload',
      patient: { id: patientId, name: patientName },
    };

    const data = await this._graphqlFetch<{ createReportTask: ReportTaskModel }>(
      `mutation CreateReportTask($input: String!) {
        createReportTask(input: $input) {
          id patientId bookingId testType status createdAt
          documentId submittedAt publishedAt
          patient { name id }
        }
      }`,
      { input: JSON.stringify(reportInput) }
    );
    if (data?.createReportTask) return success(data.createReportTask);
    return failure(new Error('Failed to create report'));
  }

  /**
   * Links an uploaded document to a report and advances status to 'Submitted'.
   * The document must already be fully uploaded (status = UPLOADED) before calling.
   */
  async submitReport(reportId: string, documentId: string): Promise<Result<void>> {
    const data = await this._graphqlFetch<{ updateReportStatus: boolean }>(
      `mutation SubmitReport($id: ID!, $documentId: ID) {
        updateReportStatus(id: $id, status: "Submitted", documentId: $documentId)
      }`,
      { id: reportId, documentId }
    );
    if (data?.updateReportStatus) return success(undefined);
    return failure(new Error('Failed to submit report'));
  }

  /**
   * Advances a report to 'Published' status.
   * Does NOT automatically modify Booking or Collection status.
   */
  async publishReport(reportId: string): Promise<Result<void>> {
    const data = await this._graphqlFetch<{ updateReportStatus: boolean }>(
      `mutation PublishReport($id: ID!) {
        updateReportStatus(id: $id, status: "Published")
      }`,
      { id: reportId }
    );
    if (data?.updateReportStatus) return success(undefined);
    return failure(new Error('Failed to publish report'));
  }

  /**
   * Generic status update — used for backward-compat status transitions.
   * For Submitted, use submitReport(). For Published, use publishReport().
   */
  async updateStatus(id: string, status: ReportTaskModel['status']): Promise<Result<void>> {
    const data = await this._graphqlFetch<{ updateReportStatus: boolean }>(
      `mutation UpdateReportStatus($id: ID!, $status: String!) {
        updateReportStatus(id: $id, status: $status)
      }`,
      { id, status }
    );
    if (data?.updateReportStatus) return success(undefined);
    return failure(new Error('Failed to update report status'));
  }

  /**
   * Gets a presigned download URL for a report document.
   * Requires the caller to have an authenticated session and access to the document.
   */
  async getDocumentDownloadUrl(documentId: string): Promise<Result<string>> {
    const data = await this._graphqlFetch<{ documentDownloadUrl: string }>(
      `query GetDocumentDownloadUrl($id: ID!) {
        documentDownloadUrl(id: $id)
      }`,
      { id: documentId }
    );
    if (data?.documentDownloadUrl) return success(data.documentDownloadUrl);
    return failure(new Error('Failed to get download URL'));
  }

  /**
   * Backward-compat shim for AlertService.
   * LIMS-style 'Awaiting Verification' / 'STAT' filters will return 0 records
   * in the new e-commerce model, so AlertService alert generation is silently suppressed.
   * @deprecated AlertService should be updated to new lifecycle states.
   */
  async getAllTasks(): Promise<Result<ReportTaskModel[]>> {
    const res = await this.getAdminWorkspace(50, null, 'All');
    if (!res.isSuccess) return failure(res.error!);
    return success((res.value.queue || []) as ReportTaskModel[]);
  }
}
