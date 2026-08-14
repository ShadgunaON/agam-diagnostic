export type Role = { id: string; title: string; internal: string; users: number; desc: string; color: string; scope?: string };

export const mockRoles: Role[] = [
  { id: 'admin', title: 'System Administrator', internal: 'ADMIN', users: 0, desc: 'Unrestricted system access.', color: '#3b82f6' },
  { id: 'op', title: 'Operation Manager', internal: 'OPERATION_MANAGER', users: 0, desc: 'Manages day-to-day operations.', color: '#10b981' },
  { id: 'path', title: 'Lead Pathologist', internal: 'PATHOLOGIST', users: 0, desc: 'Oversees lab results & reports.', color: '#8b5cf6' },
  { id: 'phleb', title: 'Phlebotomist', internal: 'FIELD_AGENT', users: 0, desc: 'Home collection field agents.', color: '#f59e0b' },
  { id: 'phleb_home', title: 'Home Collection Agent', internal: 'HOME_COLLECTION', users: 0, desc: 'Handles home sample collection visits.', color: '#0ea5e9', scope: 'home_collection' },
  { id: 'phleb_lab', title: 'In-Lab Technician', internal: 'IN_LAB_TECH', users: 0, desc: 'Handles in-lab patient visits and sample processing.', color: '#6366f1', scope: 'in_lab' },
];
