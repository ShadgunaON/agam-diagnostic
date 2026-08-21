import { IPatientRepository } from '@/domains/patient/repository';
import { PatientModel } from '@/domains/patient/model';
import { BookingService } from './BookingService';
import { ReportsService } from './ReportsService';
import { CollectionService } from './CollectionService';
import { InvoiceService } from './InvoiceService';
import { Result, success, failure } from '@/shared/result';

export class PatientService {
  constructor(
    private readonly patientRepository: IPatientRepository,
    private readonly bookingService: BookingService,
    private readonly reportsService: ReportsService,
    private readonly collectionService: CollectionService,
    private readonly invoiceService?: InvoiceService
  ) {}

  async getAll(page?: number, limit?: number) {
    return this.patientRepository.getAll(page, limit);
  }

  async getMe(): Promise<Result<PatientModel>> {
    if (this.patientRepository.getMe) {
      return this.patientRepository.getMe();
    }
    const res = await this.getAll(1, 1);
    if (res.isSuccess && res.value.data.length > 0) {
      return success(res.value.data[0]);
    }
    return failure(new Error('Patient profile not found'));
  }

  async getById(id: string) {
    return this.patientRepository.getById(id);
  }

  async update(id: string, data: Partial<PatientModel>) {
    return this.patientRepository.update(id, data);
  }

  async create(patient: Omit<PatientModel, 'id'>) {
    return this.patientRepository.create(patient);
  }

  async resolvePatientBookings(patient: PatientModel) {
    const result = await this.bookingService.getAll();
    if (!result.isSuccess) return [];

    return result.value.filter(booking => {
      // Deterministic matching based on canonical ID first
      if (booking.patientId && booking.patientId === patient.id) return true;
      
      // Fallback to phone, then email for legacy bookings.
      if (booking.patient.phone === patient.phone) return true;
      if (booking.patient.email === patient.email) return true;
      return false;
    });
  }

  async resolvePatientReports(patient: PatientModel) {
    const result = await this.reportsService.getAllTasks();
    if (!result.isSuccess) return [];

    return result.value.filter(report => {
      // 1. Deterministic match based on canonical ID
      if (report.patientId && report.patientId === patient.id) return true;
      
      // 2. Verified deterministic legacy association
      // If the legacy report's embedded patient.id strictly matches our canonical Patient.id
      if (report.patient && report.patient.id === patient.id) return true;
      
      // 3. Unresolved: we do not guess by name alone.
      return false;
    });
  }

  async resolvePatientCollections(patient: PatientModel) {
    const result = await this.collectionService.getAll();
    if (!result.isSuccess) return [];

    return result.value.filter(collection => {
      // 1. Deterministic match based on canonical ID
      if (collection.patientId && collection.patientId === patient.id) {
        return true;
      }
      
      // 2. Legacy collections without deterministic identifiers remain unresolved
      // We explicitly do not guess based on collection.patient (name string)
      return false;
    });
  }

  async resolvePatientInvoices(patient: PatientModel) {
    if (!this.invoiceService) return [];
    const result = await this.invoiceService.getAll();
    if (!result.isSuccess) return [];

    return result.value.filter(invoice => {
      // Match by canonical ID or legacy fallback through bookings if needed
      // Currently, invoice requires patientId or we match via booking
      if (invoice.patientId && invoice.patientId === patient.id) {
        return true;
      }
      return false;
    });
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
