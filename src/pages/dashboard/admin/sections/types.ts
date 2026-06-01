export type AdminTab =
  | "overview"
  | "approvals"
  | "pharmacies"
  | "subscriptions"
  | "feedbacks"
  | "audit-logs"
  | "settings"
  | "landing-page";

export interface Pharmacy {
  _id: string;
  name: string;
  pharmacyEmail?: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  licenseCode?: string;
  submittedAt?: number;
  status: string;
  paymentStatus?: string;
  signupLocation?: string;
  selectedTier?: string;
  recommendedTier?: string;
  plannedBranches?: number;
  plannedBranchLocations?: string[];
  plannedStaffTotal?: number;
  plannedStaffBreakdown?: {
    pharmacists?: number;
    managers?: number;
    cashiers?: number;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  subscriptionTier?: string;
  created_at?: string;
}
