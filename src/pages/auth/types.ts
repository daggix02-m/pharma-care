export const STEP_LABELS = [
  "Pharmacy",
  "Subscription",
  "Owner",
  "Review",
  "Verify",
] as const;

export const normalizeEmail = (email: string) => email.trim().toLowerCase();
