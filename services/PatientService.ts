import { PatientModel } from '@/domains/patient/model';
import { BookingService } from './BookingService';
import { ReportsService } from './ReportsService';
import { CollectionService } from './CollectionService';
import { InvoiceService } from './InvoiceService';
import { Result, success, failure } from '@/shared/result';
import { PaginatedResponse } from '@/lib/api/types';

export class PatientService {
  private bookingService?: BookingService;
  private reportsService?: ReportsService;
  private collectionService?: CollectionService;
  private invoiceService?: InvoiceService;

  constructor() {}

  setBookingService(service: BookingService) {
    this.bookingService = service;
  }

  setReportsService(service: ReportsService) {
    this.reportsService = service;
  }

  setCollectionService(service: CollectionService) {
    this.collectionService = service;
  }

  setInvoiceService(service: InvoiceService) {
    this.invoiceService = service;
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
      if (errors?.length) { 
        console.error('GraphQL errors:', errors); 
        throw new Error(errors[0].message);
      }
      return data as T;
    } catch (err) {
      console.error('GraphQL fetch failed:', err);
      throw err;
    }
  }

  async getAll(page = 1, limit = 10): Promise<Result<PaginatedResponse<PatientModel>>> {
    try {
      const res = await this._graphqlFetch<{ patients: PaginatedResponse<PatientModel> }>(
        `query GetPatients($page: Int, $limit: Int) {
          patients(page: $page, limit: $limit) {
            data {
              id name age gender phone email status bloodGroup relation dobOrAge ownerSub createdAt updatedAt
            }
            meta { total page limit totalPages }
          }
        }`,
        { page, limit }
      );
      return success(res!.patients);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Failed to get patients'));
    }
  }

  async getMe(): Promise<Result<PatientModel>> {
    try {
      const res = await this._graphqlFetch<{ mePatient: PatientModel }>(
        `query GetMePatient {
          mePatient {
            id name age gender phone email status bloodGroup relation dobOrAge ownerSub createdAt updatedAt
          }
        }`
      );
      if (!res?.mePatient) return failure(new Error('Patient profile not found'));
      return success(res.mePatient);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Failed to get me patient'));
    }
  }

  async getById(id: string): Promise<Result<PatientModel>> {
    try {
      const res = await this._graphqlFetch<{ patientById: PatientModel }>(
        `query PatientById($id: ID!) {
          patientById(id: $id) {
            id name age gender phone email status bloodGroup relation dobOrAge ownerSub createdAt updatedAt
          }
        }`,
        { id }
      );
      if (!res?.patientById) return failure(new Error('Patient not found'));
      return success(res.patientById);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Failed to get patient'));
    }
  }

  async update(id: string, data: Partial<PatientModel>): Promise<Result<PatientModel>> {
    try {
      const res = await this._graphqlFetch<{ updatePatient: PatientModel }>(
        `mutation UpdatePatient($id: ID!, $input: String!) {
          updatePatient(id: $id, input: $input) {
            id name age gender phone email status bloodGroup relation dobOrAge ownerSub createdAt updatedAt
          }
        }`,
        { id, input: typeof data === "string" ? data : JSON.stringify(data) }
      );
      return success(res!.updatePatient);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Failed to update patient'));
    }
  }

  async create(patient: Omit<PatientModel, 'id'>): Promise<Result<PatientModel>> {
    try {
      const res = await this._graphqlFetch<{ createPatient: PatientModel }>(
        `mutation CreatePatient($input: String!) {
          createPatient(input: $input) {
            id name age gender phone email status bloodGroup relation dobOrAge ownerSub createdAt updatedAt
          }
        }`,
        { input: typeof patient === "string" ? patient : JSON.stringify(patient) }
      );
      return success(res!.createPatient);
    } catch (err) {
      return failure(err instanceof Error ? err : new Error('Failed to create patient'));
    }
  }

  async resolvePatientBookings(patient: PatientModel) {
    if (!this.bookingService) return [];
    const result = await this.bookingService.getByPatientId(patient.id);
    if (!result.isSuccess) return [];

    return result.value.filter(booking => {
      if (booking.patientId && booking.patientId === patient.id) return true;
      if (booking.patient.phone === patient.phone) return true;
      if (booking.patient.email === patient.email) return true;
      return false;
    });
  }

  async resolvePatientReports(patient: PatientModel) {
    if (!this.reportsService) return [];
    const result = await this.reportsService.getByPatientId(patient.id);
    if (!result.isSuccess) return [];
    return result.value;
  }

  async resolvePatientCollections(patient: PatientModel) {
    if (!this.collectionService) return [];
    const result = await this.collectionService.getByPatientId(patient.id);
    if (!result.isSuccess) return [];
    return result.value;
  }

  async resolvePatientInvoices(patient: PatientModel) {
    if (!this.invoiceService) return [];
    const result = await this.invoiceService.getByPatientId(patient.id);
    if (!result.isSuccess) return [];
    return result.value;
  }

  async getPatientProfileData(patientId: string) {
    const patientResult = await this.getById(patientId);
    if (!patientResult.isSuccess) return failure(new Error('Patient not found'));

    const patient = patientResult.value;

    const [bookings, reports, collections, invoices] = await Promise.all([
      this.resolvePatientBookings(patient),
      this.resolvePatientReports(patient),
      this.resolvePatientCollections(patient),
      this.resolvePatientInvoices(patient)
    ]);

    return success({
      patient,
      bookings,
      reports,
      collections,
      invoices
    });
  }
}
