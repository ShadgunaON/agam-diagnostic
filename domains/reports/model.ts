/**
 * TestResult — retained in schema for backward compatibility with existing records.
 * Not populated in any active DB records. Do not expose in active UI.
 */
export interface TestResult {
  parameter: string;
  value: number | string;
  unit: string;
  reference: string;
  isAbnormal: boolean;
}

/**
 * ReportTaskModel — e-commerce document-delivery model.
 *
 * Active lifecycle:  Pending Upload → Submitted → Published
 * Legacy statuses:   Processing | Generated | Awaiting Verification  (DB compat only, no UI buttons)
 */
export interface ReportTaskModel {
  id: string;
  patientId?: string;
  bookingId?: string;
  patient: { name: string; age?: number; gender?: string; id: string };
  testType: string;
  createdAt?: string;

  // Active e-commerce lifecycle statuses
  status:
    | 'Pending Upload'
    | 'Submitted'
    | 'Published'
    // Backward-compat statuses — existing DB records only, no active UI actions
    | 'Processing'
    | 'Generated'
    | 'Awaiting Verification';

  // Document-delivery fields (new)
  documentId?: string;      // Links to Document record once uploaded
  submittedAt?: string;     // ISO timestamp when employee submitted
  submittedBy?: string;     // Cognito sub of submitting employee
  publishedAt?: string;     // ISO timestamp when published to customer
  publishedBy?: string;     // Cognito sub of publishing employee

  // Deprecated fields — retained for existing records, not used in active UI
  priority?: 'Routine' | 'STAT';
  results?: TestResult[];
  time?: string;
  url?: string;
  pdfKey?: string;
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
