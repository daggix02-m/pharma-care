export type OwnerTab =
  | "overview"
  | "messaging"
  | "appeals"
  | "staff"
  | "branches"
  | "transfers";

export interface StaffForm {
  full_name: string;
  email: string;
  role: string;
  branchId: string;
}
