import type { Doc } from "@convex/_generated/dataModel";

export interface StaffBreakdown {
  pharmacists: number;
  managers: number;
  cashiers: number;
}

export interface PharmacySummary {
  primaryLocation: string;
  branchLocations: string[];
  plannedBranches: number;
  submittedAt: number | null;
  status: string;
  selectedTier: string;
  recommendedTier: string;
  pharmacyName: string;
  pharmacyEmail: string;
  licenseCode: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  plannedStaffTotal: number;
  staffBreakdown: StaffBreakdown;
  termsAccepted: boolean | undefined;
}

export interface OwnerInfo {
  status?: string;
  emailVerified?: boolean;
  role?: string;
}

export type PharmacyDetailData = {
  pharmacy: Doc<"pharmacies">;
  owner: Doc<"users"> | null;
  signupSubmission: {
    primaryLocation?: string;
    branchLocations?: string[];
    plannedBranches?: number;
    submittedAt?: number;
    status?: string;
    selectedTier?: string;
    recommendedTier?: string;
    pharmacyName?: string;
    pharmacyEmail?: string;
    licenseCode?: string;
    ownerName?: string;
    ownerEmail?: string;
    ownerPhone?: string;
    plannedStaffTotal?: number;
    staffBreakdown?: StaffBreakdown;
    termsAccepted?: boolean;
  } | null;
};
