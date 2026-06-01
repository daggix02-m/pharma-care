export type ManagerTab =
  | "overview"
  | "branches"
  | "staff"
  | "transfers"
  | "audit"
  | "settings";

export interface Branch {
  _id: string;
  name: string;
  address?: string;
  status?: string;
}

export interface StaffMember {
  _id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
}

export interface AuditLog {
  _id: string;
  action?: string;
  details?: string;
  timestamp?: string;
}
