import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(), // Clerk's unique user ID
    tokenIdentifier: v.string(), // "https://issuer.clerk.accounts.dev|user_2..."
    full_name: v.string(),
    email: v.string(),
    role: v.string(), // "admin", "manager", "pharmacist", "cashier"
    status: v.string(), // "pending", "active", "deactivated"
    pharmacyId: v.optional(v.id("pharmacies")),
    branchId: v.optional(v.id("branches")),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_tokenIdentifier", ["tokenIdentifier"])
    .index("by_status", ["status"])
    .index("by_role", ["role"]),

  pharmacies: defineTable({
    name: v.string(),
    licenseCode: v.string(),
    staffCount: v.number(),
    subscriptionTier: v.string(), // "basic", "premium", "enterprise"
    status: v.string(), // "active", "deactivated", "pending"
    ownerId: v.id("users"),
    inviteCode: v.optional(v.string()),
    refundPolicy: v.optional(
      v.object({
        allow_refunds: v.boolean(),
        refund_window_days: v.number(),
        allow_discounts: v.boolean(),
        max_discount_percent: v.number(),
        require_manager_approval: v.boolean(),
      })
    ),
  }).index("by_owner", ["ownerId"]),

  branches: defineTable({
    pharmacyId: v.id("pharmacies"),
    name: v.string(),
    address: v.optional(v.string()),
    status: v.string(), // "pending", "active", "rejected", "deactivated"
    managerId: v.id("users"),
  })
    .index("by_pharmacy", ["pharmacyId"])
    .index("by_status", ["status"]),

  medicines: defineTable({
    branchId: v.id("branches"),
    name: v.string(),
    category: v.string(),
    stock: v.number(),
    price: v.number(),
    minStock: v.optional(v.number()),
    type: v.optional(v.string()),
    manufacturer: v.optional(v.string()),
    barcode: v.optional(v.string()),
    expiryDate: v.optional(v.number()), // timestamp
    prescriptionRequired: v.optional(v.boolean()),
    status: v.optional(v.string()), // "active", "returned", "disposed"
  }).index("by_branch", ["branchId"]),

  sales: defineTable({
    branchId: v.id("branches"),
    cashierId: v.id("users"),
    totalAmount: v.number(),
    status: v.string(),
    customerName: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    paymentMethod: v.string(),
    prescriptionId: v.optional(v.string()),
    items: v.array(
      v.object({
        medicineId: v.id("medicines"),
        quantity: v.number(),
        price: v.number(),
      })
    ),
    chapaTransactionId: v.optional(v.string()),
    chapaPaymentMethod: v.optional(v.string()),
    chapaStatus: v.optional(v.string()),
    chapaReference: v.optional(v.string()),
  }).index("by_branch", ["branchId"]),
  
  audit_logs: defineTable({
    userId: v.id("users"),
    action: v.string(), // e.g., "approve_branch", "delete_pharmacy"
    entityId: v.string(),
    entityType: v.string(), // e.g., "branch", "pharmacy"
    details: v.optional(v.string()),
    timestamp: v.number(),
  }).index("by_user", ["userId"]),

  notifications: defineTable({
    userId: v.id("users"),
    pharmacyId: v.optional(v.id("pharmacies")),
    title: v.string(),
    message: v.string(),
    type: v.string(), // "transaction", "stock", "staff", "system"
    priority: v.string(), // "low", "medium", "high"
    read: v.boolean(),
  }).index("by_user", ["userId"]),
 
  stock_requests: defineTable({
    branchId: v.id("branches"),
    pharmacistId: v.id("users"),
    medicineId: v.id("medicines"),
    quantity: v.number(),
    urgency: v.string(), // "low", "normal", "high"
    status: v.string(), // "pending", "approved", "rejected", "fulfilled"
    notes: v.optional(v.string()),
  }).index("by_branch", ["branchId"]),
});
