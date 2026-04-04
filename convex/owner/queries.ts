// @ts-ignore
import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireOwner } from "../lib/auth";

export const getMyMessages = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const owner = await requireOwner(ctx, args.sessionToken);

    const pharmacyId = owner.pharmacyId;
    if (!pharmacyId) {
      throw new Error("No pharmacy associated with this owner");
    }

    const messages = await ctx.db
      .query("owner_messages")
      .withIndex("by_pharmacy", (q: any) => q.eq("pharmacyId", pharmacyId))
      .order("desc")
      .collect();

    return messages;
  },
});

export const getMessageStatus = query({
  args: {
    messageId: v.id("owner_messages"),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const owner = await requireOwner(ctx, args.sessionToken);

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    if (message.pharmacyId !== owner.pharmacyId) {
      throw new Error("Unauthorized: Not your message");
    }

    return message;
  },
});

export const getPendingActions = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const owner = await requireOwner(ctx, args.sessionToken);

    const pharmacyId = owner.pharmacyId;
    if (!pharmacyId) {
      throw new Error("No pharmacy associated with this owner");
    }

    const adminActions = await ctx.db
      .query("admin_actions")
      .withIndex("by_target_pharmacy", (q: any) =>
        q.eq("targetPharmacyId", pharmacyId),
      )
      .order("desc")
      .collect();

    const flaggedUsers = await ctx.db
      .query("users")
      .filter((q: any) =>
        q.and(
          q.eq(q.field("pharmacyId"), pharmacyId),
          q.eq(q.field("adminFlagged"), true),
        ),
      )
      .collect();

    const lockedUsers = await ctx.db
      .query("users")
      .filter((q: any) =>
        q.and(
          q.eq(q.field("pharmacyId"), pharmacyId),
          q.eq(q.field("adminLocked"), true),
        ),
      )
      .collect();

    return {
      adminActions,
      flaggedUsers,
      lockedUsers,
      totalCount:
        adminActions.length + flaggedUsers.length + lockedUsers.length,
    };
  },
});

export const getAppealHistory = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const owner = await requireOwner(ctx, args.sessionToken);

    const pharmacyId = owner.pharmacyId;
    if (!pharmacyId) {
      throw new Error("No pharmacy associated with this owner");
    }

    const allManagerFlags = await ctx.db.query("manager_flags").collect();

    const managerFlagAppeals = await Promise.all(
      allManagerFlags.map(async (flag: any) => {
        const manager = await ctx.db.get(flag.managerId);
        if (manager?.pharmacyId === pharmacyId && flag.ownerResponse) {
          const flaggedBy = await ctx.db.get(flag.flaggedBy);
          return {
            id: flag._id,
            type: "manager_flag",
            managerName: manager?.full_name || "Unknown",
            managerEmail: manager?.email || "",
            flaggedBy: flaggedBy?.full_name || "System",
            flaggedAt: flag.flaggedAt,
            flagReason: flag.flagReason,
            ownerResponse: flag.ownerResponse,
            ownerRespondedAt: flag.ownerRespondedAt,
            status: flag.status,
          };
        }
        return null;
      }),
    );

    const allAdminActions = await ctx.db.query("admin_actions").collect();

    const adminActionAppeals = await Promise.all(
      allAdminActions.map(async (action: any) => {
        if (action.targetPharmacyId === pharmacyId && action.ownerNotified) {
          const targetUser = await ctx.db.get(action.targetUserId);
          const performedBy = await ctx.db.get(action.performedBy);
          return {
            id: action._id,
            type: "admin_action",
            targetUserName: targetUser?.full_name || "Unknown",
            targetUserEmail: targetUser?.email || "",
            performedBy: performedBy?.full_name || "System",
            actionType: action.actionType,
            reason: action.reason,
            timestamp: action.timestamp,
            ownerNotifiedAt: action.ownerNotifiedAt,
            actionStatus: action.actionStatus,
          };
        }
        return null;
      }),
    );

    return {
      managerFlagAppeals: managerFlagAppeals.filter(Boolean),
      adminActionAppeals: adminActionAppeals.filter(Boolean),
      totalAppeals:
        managerFlagAppeals.filter(Boolean).length +
        adminActionAppeals.filter(Boolean).length,
    };
  },
});

export const getMyPharmacyDetail = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const owner = await requireOwner(ctx, args.sessionToken);

    if (!owner.pharmacyId) {
      throw new Error("No pharmacy associated with this owner");
    }

    const pharmacy = await ctx.db.get(owner.pharmacyId);
    if (!pharmacy) {
      return {
        pharmacy: null,
        branches: [],
        staff: [],
        signupProfile: null,
        missingPharmacy: true,
      };
    }

    const branches = await ctx.db
      .query("branches")
      .withIndex("by_pharmacy", (q: any) =>
        q.eq("pharmacyId", owner.pharmacyId),
      )
      .take(200);

    const staff = await ctx.db
      .query("users")
      .withIndex("by_pharmacy", (q: any) =>
        q.eq("pharmacyId", owner.pharmacyId),
      )
      .take(500);

    const signupProfile = {
      ownerName: owner.full_name || "",
      ownerEmail: owner.email || "",
      ownerPhone: owner.phone || "",
      name: pharmacy.name || "",
      pharmacyEmail: pharmacy.pharmacyEmail || "",
      licenseCode: pharmacy.licenseCode || "",
      signupLocation:
        pharmacy.signupLocation || pharmacy.plannedBranchLocations?.[0] || "",
      selectedTier: pharmacy.subscriptionTier || "",
      recommendedTier: pharmacy.recommendedSubscriptionTier || "",
      paymentStatus: pharmacy.paymentStatus || "",
      plannedBranches: pharmacy.plannedBranches,
      plannedBranchLocations: pharmacy.plannedBranchLocations || [],
      plannedStaffTotal: pharmacy.plannedStaffTotal,
      plannedStaffBreakdown: pharmacy.plannedStaffBreakdown,
      submittedAt: pharmacy._creationTime,
    };

    return {
      pharmacy,
      branches,
      staff,
      signupProfile,
      missingPharmacy: false,
    };
  },
});
