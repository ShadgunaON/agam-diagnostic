import { ReportTaskModel } from '@/domains/reports/model';

export const mockReportTasks: ReportTaskModel[] = [
  {
    id: 'REP-1045',
    patient: { name: 'Vikram Singh', age: 42, gender: 'M', id: 'PT-8892' },
    testType: 'Complete Blood Count (CBC)',
    status: 'Awaiting Verification',
    priority: 'Routine',
    time: '11:15 AM Today',
    results: [
      { parameter: 'Hemoglobin', value: 11.2, unit: 'g/dL', reference: '13.8 - 17.2', isAbnormal: true },
      { parameter: 'WBC Count', value: 7500, unit: 'cells/mcL', reference: '4,500 - 11,000', isAbnormal: false },
      { parameter: 'Platelets', value: 210000, unit: 'cells/mcL', reference: '150,000 - 450,000', isAbnormal: false },
      { parameter: 'RBC Count', value: 4.1, unit: 'million/mcL', reference: '4.7 - 6.1', isAbnormal: true },
    ]
  },
  {
    id: 'REP-1046',
    patient: { name: 'Anita Desai', age: 35, gender: 'F', id: 'PT-8893' },
    testType: 'Lipid Profile',
    status: 'Awaiting Verification',
    priority: 'Routine',
    time: '10:30 AM Today',
    results: [
      { parameter: 'Total Cholesterol', value: 240, unit: 'mg/dL', reference: '< 200', isAbnormal: true },
      { parameter: 'HDL Cholesterol', value: 45, unit: 'mg/dL', reference: '> 50', isAbnormal: true },
      { parameter: 'LDL Cholesterol', value: 160, unit: 'mg/dL', reference: '< 100', isAbnormal: true },
      { parameter: 'Triglycerides', value: 175, unit: 'mg/dL', reference: '< 150', isAbnormal: true },
    ]
  },
  {
    id: 'REP-1047',
    patient: { name: 'Suresh Menon', age: 58, gender: 'M', id: 'PT-8894' },
    testType: 'HbA1c & Fasting Glucose',
    status: 'Awaiting Verification',
    priority: 'STAT',
    time: '09:00 AM Today',
    results: [
      { parameter: 'HbA1c', value: 8.2, unit: '%', reference: '< 5.7', isAbnormal: true },
      { parameter: 'Fasting Blood Sugar', value: 145, unit: 'mg/dL', reference: '70 - 100', isAbnormal: true },
    ]
  }
];
export interface ReportsData {
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

export const reportsData: ReportsData = {
  hero: {
    title: 'My Reports',
    description: 'View and download your diagnostic reports securely.',
  },
  emptyState: {
    title: 'No reports available yet',
    description: 'Your reports will appear here once your backend system is connected. This is an architecture placeholder.',
    icon: '📄',
    actionLabel: 'Book a Test',
    actionUrl: '/book',
  },
};
