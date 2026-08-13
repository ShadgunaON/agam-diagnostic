export interface TestResult {
  parameter: string;
  value: number | string;
  unit: string;
  reference: string;
  isAbnormal: boolean;
}

export interface ReportTaskModel {
  id: string;
  patientId?: string;
  bookingId?: string;
  patient: { name: string; age: number; gender: string; id: string };
  testType: string;
  status: 'Processing' | 'Generated' | 'Awaiting Verification' | 'Pending Upload' | 'Published';
  priority: 'Routine' | 'STAT';
  time: string;
  results: TestResult[];
}

export interface ReportsModel {
  id: string;
  hero: {
    title: string;
    description: string;
  };
  emptyState: {
    title: string;
    description: string;
    icon: string;
    actionLabel: string;
    actionUrl: string;
  };
}
