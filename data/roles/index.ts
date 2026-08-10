export type Role = { id: string; title: string; internal: string; users: number; desc: string; color: string };

export const mockRoles: Role[] = [
  { id: 'admin', title: 'System Administrator', internal: 'ADMIN', users: 3, desc: 'Unrestricted system access.', color: '#3b82f6' },
  { id: 'op', title: 'Operation Manager', internal: 'OPERATION_MANAGER', users: 12, desc: 'Manages day-to-day operations.', color: '#10b981' },
  { id: 'path', title: 'Lead Pathologist', internal: 'PATHOLOGIST', users: 5, desc: 'Oversees lab results & reports.', color: '#8b5cf6' },
  { id: 'phleb', title: 'Phlebotomist', internal: 'FIELD_AGENT', users: 24, desc: 'Home collection field agents.', color: '#f59e0b' },
];
