export interface PharmacyFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
}

export interface StaffMember {
  id?: string;
  name?: string;
  avatarUrl?: string;
  role?: string;
  email?: string;
  phone?: string;
  joinDate?: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  staff?: StaffMember[];
  [key: string]: unknown;
}
