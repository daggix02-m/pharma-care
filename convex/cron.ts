import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

// Manual cleanup endpoint for old messages
export const cleanupOldMessages = internalMutation({
  args: {},
  handler: async (ctx: any) => {
    const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;
    const cutoffDate = Date.now() - SIXTY_DAYS_MS;

    let deletedCount = 0;

    // Delete old messages from main table
    const oldMessages = await ctx.db
      .query("contact_messages")
      .withIndex("by_created", (q: any) => q.lt("createdAt", cutoffDate))
      .collect();

    for (const message of oldMessages) {
      await ctx.db.delete(message._id);
      deletedCount++;
    }

    // Delete old messages from trash
    const oldTrashedMessages = await ctx.db
      .query("contact_messages_trash")
      .withIndex("by_deleted", (q: any) => q.lt("deletedAt", cutoffDate))
      .collect();

    for (const message of oldTrashedMessages) {
      await ctx.db.delete(message._id);
      deletedCount++;
    }

    // Log cleanup results
    console.log(`[CLEANUP] Completed at ${new Date().toISOString()}`);
    console.log(`[CLEANUP] Deleted ${deletedCount} old messages`);

    return {
      success: true,
      deletedCount,
      timestamp: Date.now(),
    };
  },
});

export const cancelStaleTransferRequests = internalAction({
  args: {},
  handler: async (
    ctx: any,
  ): Promise<{
    success: boolean;
    cancelled: number;
    staleAfterHours: number;
    timestamp: number;
  }> => {
    const result: { cancelled: number; staleAfterHours: number } =
      await ctx.runMutation(
        internal.stockTransfers.cancelStalePendingTransferRequestsInternal,
        {
          staleAfterHours: 72,
        },
      );

    console.log(
      `[TRANSFER-CLEANUP] Cancelled ${result.cancelled} stale transfer requests`,
    );

    return {
      success: true,
      cancelled: result.cancelled,
      staleAfterHours: result.staleAfterHours,
      timestamp: Date.now(),
    };
  },
});

export const cleanupExpiredRejectedApplications = internalMutation({
  args: {},
  handler: async (ctx: any) => {
    const now = Date.now();
    let deletedCount = 0;

    while (true) {
      const expired = await ctx.db
        .query("rejected_owner_applications")
        .withIndex("by_retention_until", (q: any) =>
          q.lt("retentionUntil", now),
        )
        .take(100);

      if (expired.length === 0) {
        break;
      }

      for (const row of expired) {
        await ctx.db.delete(row._id);
        deletedCount += 1;
      }
    }

    return {
      success: true,
      deletedCount,
      timestamp: now,
    };
  },
});
