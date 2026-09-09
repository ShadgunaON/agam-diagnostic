import { ReportTaskModel } from '@/domains/reports/model';
import { CollectionTaskModel } from '@/domains/collections/model';
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
      const _url = typeof window === 'undefined' ? (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000') + '/api/graphql' : '/api/graphql';
      const response = await fetch(_url, {
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

  async getById(id: string): Promise<Result<ReportTaskModel>> {
    const data = await this._graphqlFetch<{ reportById: ReportTaskModel }>(
      `query ReportById($id: ID!) {
        reportById(id: $id) {
          id patientId bookingId testType status priority time results { parameter value unit reference isAbnormal }
          patient { name age gender id }
        }
      }`,
      { id }
    );
    if (data?.reportById) return success(data.reportById);
    return failure(new Error('Report not found'));
  }

  async getAllTasks(): Promise<Result<ReportTaskModel[]>> {
    const data = await this._graphqlFetch<{ reports: ReportTaskModel[] }>(
      `query {
        reports {
          id patientId bookingId testType status priority time results { parameter value unit reference isAbnormal }
          patient { name age gender id }
        }
      }`
    );
    if (data?.reports) return success(data.reports);
    return failure(new Error('Failed to load reports'));
  }

  async getAdminWorkspace(limit = 20, cursor: string | null = null, status = 'All', sort = 'date_newest', search = '') {
    try {
      const data = await this._graphqlFetch<{ adminReportsWorkspace: any }>(
        `query GetReportsWorkspace($limit: Int, $cursor: String, $status: String, $sort: String, $search: String) {
          adminReportsWorkspace(limit: $limit, cursor: $cursor, status: $status, sort: $sort, search: $search) {
            queue {
              id status priority createdAt testType time url pdfKey
              patient { name id age gender }
              results { parameter value unit reference isAbnormal }
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
          id patientId bookingId testType status priority time results { parameter value unit reference isAbnormal }
          patient { name age gender id }
        }
      }`,
      { patientId }
    );
    if (data?.reportsByPatient) return success(data.reportsByPatient);
    return failure(new Error('Failed to load reports for patient'));
  }

  async createFromCollection(collection: CollectionTaskModel): Promise<Result<ReportTaskModel>> {
    const reportTask: ReportTaskModel = {
      id: `REP-${collection.bookingId?.replace('B-', '') || Date.now()}`,
      patientId: collection.patientId,
      bookingId: collection.bookingId,
      patient: { name: collection.patient, age: 30, gender: 'Male', id: collection.patientId || 'pat_1' },
      testType: collection.tests.join(', '),
      status: 'Processing',
      priority: 'Routine',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      results: []
    };
    
    const data = await this._graphqlFetch<{ createReportTask: ReportTaskModel }>(
      `mutation CreateReportTask($input: String!) {
        createReportTask(input: $input) {
          id patientId bookingId testType status priority time results { parameter value unit reference isAbnormal }
          patient { name age gender id }
        }
      }`,
      { input: typeof reportTask === "string" ? reportTask : JSON.stringify(reportTask) }
    );
    if (data?.createReportTask) return success(data.createReportTask);
    return failure(new Error('Failed to create report task'));
  }

  async updateStatus(id: string, status: ReportTaskModel['status']): Promise<Result<ReportTaskModel>> {
    const data = await this._graphqlFetch<{ updateReportStatus: boolean }>(
      `mutation UpdateReportStatus($id: ID!, $status: String!) {
        updateReportStatus(id: $id, status: $status)
      }`,
      { id, status }
    );
    if (data?.updateReportStatus) return success({ id, status } as ReportTaskModel);
    return failure(new Error('Failed to update report status'));
  }
}
