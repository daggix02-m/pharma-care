import { internalAction } from './_generated/server';

// Manual cleanup endpoint for old messages
export const cleanupOldMessages = internalAction({
  args: {},
  handler: async (ctx) => {
    const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;
    const cutoffDate = Date.now() - SIXTY_DAYS_MS;

    let deletedCount = 0;

    // Delete old messages from main table
    const oldMessages = await ctx.db
      .query('contact_messages')
      .withIndex('by_created', (q) => q.lt(cutoffDate))
      .collect();

    for (const message of oldMessages) {
      await ctx.db.delete(message._id);
      deletedCount++;
    }

    // Delete old messages from trash
    const oldTrashedMessages = await ctx.db
      .query('contact_messages_trash')
      .withIndex('by_deleted', (q) => q.lt(cutoffDate))
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
