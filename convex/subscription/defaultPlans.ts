export type SignupPlanSeed = {
  code: string;
  name: string;
  description: string;
  price: number;
  currency: "ETB";
  maxBranches: number;
  maxUsers: number;
  features: string[];
  isActive: boolean;
};

export const DEFAULT_SIGNUP_PLANS: SignupPlanSeed[] = [
  {
    code: "basic",
    name: "Basic",
    description: "Starter plan for single-branch pharmacies.",
    price: 1999,
    currency: "ETB",
    maxBranches: 1,
    maxUsers: 8,
    features: [
      "Inventory management",
      "Sales tracking",
      "Role-based staff access",
    ],
    isActive: true,
  },
  {
    code: "premium",
    name: "Premium",
    description: "Growth plan for expanding pharmacy operations.",
    price: 4999,
    currency: "ETB",
    maxBranches: 5,
    maxUsers: 35,
    features: [
      "Advanced reporting",
      "Multi-branch controls",
      "Transfer workflow tools",
    ],
    isActive: true,
  },
  {
    code: "enterprise",
    name: "Enterprise",
    description: "Scale plan for enterprise pharmacy networks.",
    price: 9999,
    currency: "ETB",
    maxBranches: 25,
    maxUsers: 150,
    features: [
      "Priority support",
      "Enterprise analytics",
      "Operational automation",
    ],
    isActive: true,
  },
];
