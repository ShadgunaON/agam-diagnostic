import { IPatientRepository } from '@/domains/patient/repository';
import { PatientModel } from '@/domains/patient/model';
import { Result, success, failure } from '@/shared/result';
import { PaginatedResponse } from '@/lib/api/types';
import { SharedMockAdapter } from '@/lib/storage/SharedMockAdapter';

const mockPatientsData = [
  { id: 'PT-2023-001', name: 'Rahul Sharma', age: 45, gender: 'Male', phone: '+91 98765 43210', email: 'rahul.s@example.com', lastVisit: 'Oct 12, 2026', status: 'Active', bloodGroup: 'O+' },
  { id: 'PT-2023-002', name: 'Priya Patel', age: 32, gender: 'Female', phone: '+91 91234 56789', email: 'priya.p@example.com', lastVisit: 'Oct 13, 2026', status: 'Active', bloodGroup: 'A+' },
  { id: 'PT-2023-003', name: 'Anil Kumar', age: 58, gender: 'Male', phone: '+91 99887 76655', email: 'anil.k@example.com', lastVisit: 'Oct 14, 2026', status: 'Active', bloodGroup: 'B+' },
  { id: 'PT-2023-004', name: 'Meera Reddy', age: 28, gender: 'Female', phone: '+91 98765 12345', email: 'meera.r@example.com', lastVisit: 'Oct 10, 2026', status: 'Inactive', bloodGroup: 'AB+' },
  { id: 'PT-2023-005', name: 'Suresh Menon', age: 62, gender: 'Male', phone: '+91 94444 33333', email: 'suresh.m@example.com', lastVisit: 'Oct 12, 2026', status: 'Active', bloodGroup: 'O-' },
  { id: 'PT-2023-006', name: 'Kavita Singh', age: 35, gender: 'Female', phone: '+91 90000 11111', email: 'kavita.s@example.com', lastVisit: 'Oct 08, 2026', status: 'Active', bloodGroup: 'A-' },
  { id: 'PT-2023-007', name: 'Vikram Joshi', age: 41, gender: 'Male', phone: '+91 91111 22222', email: 'vikram.j@example.com', lastVisit: 'Oct 17, 2026', status: 'Active', bloodGroup: 'B-' },
  { id: 'PT-2023-008', name: 'Anita Desai', age: 50, gender: 'Female', phone: '+91 92222 33333', email: 'anita.d@example.com', lastVisit: 'Sep 25, 2026', status: 'Inactive', bloodGroup: 'O+' },
  { id: 'PT-2023-009', name: 'Rajeev Nair', age: 29, gender: 'Male', phone: '+91 93333 44444', email: 'rajeev.n@example.com', lastVisit: 'Oct 05, 2026', status: 'Active', bloodGroup: 'AB-' },
  { id: 'PT-2023-010', name: 'Sneha Gupta', age: 38, gender: 'Female', phone: '+91 95555 66666', email: 'sneha.g@example.com', lastVisit: 'Aug 14, 2026', status: 'Inactive', bloodGroup: 'A+' },
];

export class MockPatientRepository implements IPatientRepository {
  private adapter: SharedMockAdapter<PatientModel[]>;
  private initialPatients: PatientModel[];

  constructor() {
    this.adapter = new SharedMockAdapter<PatientModel[]>('agam_mock_patients_state');
    
    // Seed with initial mock patients if no local state
    this.initialPatients = mockPatientsData.map(p => ({
      id: p.id,
      name: p.name,
      age: p.age,
      gender: p.gender,
      phone: p.phone,
      email: p.email,
      status: p.status as 'Active' | 'Inactive',
      bloodGroup: p.bloodGroup,
      createdAt: p.lastVisit, 
      updatedAt: p.lastVisit,
    }));
  }

  private async getPatients(): Promise<PatientModel[]> {
    const loaded = await this.adapter.load();
    if (loaded && loaded.length > 0) {
      return loaded;
    }
    return [...this.initialPatients];
  }

  private async savePatients(patients: PatientModel[]): Promise<void> {
    await this.adapter.save(patients);
  }

  async getAll(page = 1, limit = 10): Promise<Result<PaginatedResponse<PatientModel>>> {
    const patients = await this.getPatients();
    return success({
      data: patients,
      meta: {
        total: patients.length,
        page,
        limit,
        totalPages: Math.ceil(patients.length / limit)
      }
    });
  }

  async getMe(): Promise<Result<PatientModel>> {
    const patients = await this.getPatients();
    if (patients.length > 0) {
      return success(patients[0]);
    }
    return success(this.initialPatients[0]);
  }

  async getById(id: string): Promise<Result<PatientModel>> {
    const patients = await this.getPatients();
    const patient = patients.find(p => p.id === id);
    if (!patient) return failure(new Error('Patient not found'));
    return success(patient);
  }

  async update(id: string, data: Partial<PatientModel>): Promise<Result<PatientModel>> {
    const patients = await this.getPatients();
    const index = patients.findIndex(p => p.id === id);
    if (index === -1) return failure(new Error('Patient not found'));

    patients[index] = { ...patients[index], ...data, updatedAt: new Date().toISOString() };
    await this.savePatients(patients);
    return success(patients[index]);
  }

  async create(patientData: Omit<PatientModel, 'id'>): Promise<Result<PatientModel>> {
    const patients = await this.getPatients();
    const id = `PT-${new Date().getFullYear()}-${String(patients.length + 1).padStart(3, '0')}`;
    const newPatient: PatientModel = {
      ...patientData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    patients.push(newPatient);
    await this.savePatients(patients);
    return success(newPatient);
  }
}
