import { Id } from "../../../../convex/_generated/dataModel";

interface Sale {
  _id: Id<"sales">;
  _creationTime: number;
  customerName?: string;
  totalAmount?: number;
  items?: Array<{
    medicineId: Id<"medicines">;
    quantity: number;
    price: number;
  }>;
}

interface ReturnableItem {
  medicineId: Id<"medicines">;
  medicineName: string;
  category: string;
  canReturn: boolean;
  quantity: number;
  price: number;
}

interface SelectedItem {
  quantity: number;
}

export type { Sale, ReturnableItem, SelectedItem };
