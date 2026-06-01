// @ts-ignore
import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error("Notification not found");
    }

    if (notification.userId !== user._id) {
      throw new Error("Unauthorized: Not your notification");
    }

    await ctx.db.patch(args.notificationId, {
      read: true,
      readAt: Date.now(),
    });

    return { success: true };
  },
});

export const markAllAsRead = mutation({
  handler: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const notifications = await ctx.db
      .query("notifications")
      .filter((q: any) =>
        q.and(q.eq(q.field("userId"), user._id), q.eq(q.field("read"), false)),
      )
      .collect();

    for (const notification of notifications) {
      await ctx.db.patch(notification._id, {
        read: true,
        readAt: Date.now(),
      });
    }

    return { success: true, count: notifications.length };
  },
});

export const createNotification = mutation({
  args: {
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      link: args.link || null,
      read: false,
      readAt: null,
      createdAt: Date.now(),
    });

    return { success: true };
  },
});
