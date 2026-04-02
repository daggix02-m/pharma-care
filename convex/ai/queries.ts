// @ts-ignore
import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireAdmin, requireAuth } from "../lib/auth";

export const getConversation = query({
  args: {
    userId: v.id("users"),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const user = await requireAuth(ctx, args.sessionToken);

    if (user._id !== args.userId) {
      throw new Error("Unauthorized: Not your conversation");
    }

    const conversation = await ctx.db
      .query("ai_conversations")
      .withIndex("by_userId", (q: any) => q.eq("userId", user._id))
      .filter((q: any) =>
        q.or(
          q.eq(q.field("status"), "active"),
          q.eq(q.field("status"), "escalated"),
        ),
      )
      .first();

    if (!conversation) {
      return {
        messages: [],
        unreadCount: 0,
        status: "new",
      };
    }

    return {
      _id: conversation._id,
      messages: conversation.messages || [],
      unreadCount: conversation.unreadCount || 0,
      status: conversation.status,
      escalated: conversation.escalated,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  },
});

export const getConversationById = query({
  args: {
    conversationId: v.id("ai_conversations"),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const user = await requireAuth(ctx, args.sessionToken);

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (conversation.userId !== user._id && user.role !== "admin") {
      throw new Error("Unauthorized: Not your conversation");
    }

    return conversation;
  },
});

export const getEscalations = query({
  args: {
    status: v.optional(v.string()),
    pharmacyId: v.optional(v.id("pharmacies")),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const user = await requireAuth(ctx, args.sessionToken);

    let escalationsQuery = ctx.db.query("ai_escalations");

    // Filter by status
    if (args.status) {
      escalationsQuery = escalationsQuery.filter((q: any) =>
        q.eq(q.field("status"), args.status),
      );
    }

    // Filter by pharmacy (for owners)
    if (args.pharmacyId && user.role !== "admin") {
      escalationsQuery = escalationsQuery.filter((q: any) =>
        q.eq(q.field("pharmacyId"), args.pharmacyId),
      );
    }

    // For non-admin users, only show escalations related to their pharmacy
    if (user.role !== "admin") {
      const userPharmacy = await ctx.db
        .query("pharmacies")
        .withIndex("by_ownerId", (q: any) => q.eq("ownerId", user._id))
        .first();

      if (userPharmacy) {
        escalationsQuery = escalationsQuery.filter((q: any) =>
          q.eq(q.field("pharmacyId"), userPharmacy._id),
        );
      } else {
        // User is staff, show escalations they created
        escalationsQuery = escalationsQuery.filter((q: any) =>
          q.eq(q.field("userId"), user._id),
        );
      }
    }

    const escalations = await escalationsQuery.order("desc").take(50);

    return Promise.all(
      escalations.map(async (escalation: any) => {
        const user = await ctx.db.get(escalation.userId);
        const pharmacy = escalation.pharmacyId
          ? await ctx.db.get(escalation.pharmacyId)
          : null;

        return {
          ...escalation,
          user: user
            ? {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
              }
            : null,
          pharmacy: pharmacy
            ? {
                _id: pharmacy._id,
                name: pharmacy.name,
              }
            : null,
        };
      }),
    );
  },
});

export const getEscalationStats = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    await requireAdmin(ctx, args.sessionToken);

    const allEscalations = await ctx.db.query("ai_escalations").collect();

    const stats = {
      total: allEscalations.length,
      pending: allEscalations.filter((e: any) => e.status === "pending").length,
      resolved: allEscalations.filter((e: any) => e.status === "resolved")
        .length,
      byType: {
        phone: allEscalations.filter((e: any) => e.type === "phone").length,
        email: allEscalations.filter((e: any) => e.type === "email").length,
        complaint: allEscalations.filter((e: any) => e.type === "complaint")
          .length,
      },
      today: allEscalations.filter((e: any) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return e.escalatedAt >= today.getTime();
      }).length,
    };

    return stats;
  },
});

export const getAIFeedback = query({
  args: {
    conversationId: v.id("ai_conversations"),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const user = await requireAuth(ctx, args.sessionToken);

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (conversation.userId !== user._id && user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    return conversation.feedback || null;
  },
});
