import type { Id } from "@convex/_generated/dataModel";

export type PharmacistTab =
  | "overview"
  | "medicines"
  | "expiry"
  | "stock"
  | "reports";

export interface Medicine {
  _id: Id<"medicines">;
  _creationTime: number;
  branchId: Id<"branches">;
  name: string;
  category: string;
  stock: number;
  price: number;
  minStock?: number;
  type?: string;
  manufacturer?: string;
  barcode?: string;
  expiryDate?: number;
  status?: string;
  genericName?: string;
  prescriptionRequired?: boolean;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  onClick?: () => void;
  actionLabel?: string;
}
