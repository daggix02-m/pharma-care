import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { internal } from "../_generated/api";

// Get contact messages with pagination and filters
export const getMessages = query({
  args: {
    status: v.optional(v.string()), // "all", "unread", "read", "replied"
    searchQuery: v.optional(v.string()),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    let queryRunner: any = ctx.db.query("contact_messages");

    // Apply status filter
    if (args.status && args.status !== "all") {
      queryRunner = queryRunner.withIndex("by_status", (q: any) =>
        q.eq("status", args.status),
      );
    }

    // Get messages ordered by creation date (newest first)
    let messages = await queryRunner.order("desc").take(limit + 1);

    // Apply search filter if provided
    if (args.searchQuery) {
      const searchLower = args.searchQuery.toLowerCase();
      messages = messages.filter(
        (m: any) =>
          m.firstName.toLowerCase().includes(searchLower) ||
          m.lastName.toLowerCase().includes(searchLower) ||
          m.email.toLowerCase().includes(searchLower) ||
          m.message.toLowerCase().includes(searchLower),
      );
    }

    // Handle pagination
    const hasMore = messages.length > limit;
    const results = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor = hasMore ? results[results.length - 1]?._id : null;

    return {
      messages: results,
      nextCursor,
      hasMore,
    };
  },
});

// Get a single message by ID
export const getMessage = query({
  args: {
    messageId: v.id("contact_messages"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }
    return message;
  },
});

// Get unread count
export const getUnreadCount = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx) => {
    const unreadMessages = await ctx.db
      .query("contact_messages")
      .withIndex("by_status", (q) => q.eq("status", "unread"))
      .collect();
    return unreadMessages.length;
  },
});

// Mark message as read
export const markAsRead = mutation({
  args: {
    messageId: v.id("contact_messages"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    await ctx.db.patch(args.messageId, { status: "read" });
    return { success: true };
  },
});

// Mark message as unread
export const markAsUnread = mutation({
  args: {
    messageId: v.id("contact_messages"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    await ctx.db.patch(args.messageId, { status: "unread" });
    return { success: true };
  },
});

// Reply to message
export const replyToMessage = mutation({
  args: {
    messageId: v.id("contact_messages"),
    reply: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate reply
    if (!args.reply.trim()) {
      throw new Error("Reply cannot be empty");
    }
    if (args.reply.length > 2000) {
      throw new Error("Reply must be less than 2000 characters");
    }

    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Update message with reply
    await ctx.db.patch(args.messageId, {
      status: "replied",
      adminReply: args.reply,
      repliedAt: Date.now(),
    });

    // Get site settings
    const settings = await ctx.db.query("site_settings").first();

    if (settings && settings.resendApiKey) {
      try {
        // Send reply email to user
        await ctx.runAction(internal.lib.email.sendEmail, {
          to: message.email,
          subject: "Re: Your Message to PharmaCare",
          html: createReplyEmailHtml(
            message.firstName,
            args.reply,
            message.message,
          ),
          apiKey: settings.resendApiKey,
          testMode: settings.testMode,
        });

        // Mark email as sent
        await ctx.db.patch(args.messageId, { emailSent: true });
      } catch (error) {
        console.error("Failed to send reply email:", error);
        // Continue - reply is saved even if email fails
      }
    }

    return {
      success: true,
      message: "Reply sent successfully",
    };
  },
});

// Move message to trash
export const moveToTrash = mutation({
  args: {
    messageId: v.id("contact_messages"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    // Insert into trash
    await ctx.db.insert("contact_messages_trash", {
      ...message,
      deletedAt: Date.now(),
      deletedBy: ctx.auth?.userId || (null as any),
      originalId: args.messageId,
    });

    // Delete from main table
    await ctx.db.delete(args.messageId);

    return { success: true };
  },
});

// Get trashed messages
export const getTrashedMessages = query({
  args: {
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const messages = await ctx.db
      .query("contact_messages_trash")
      .order("desc")
      .take(limit + 1);

    const hasMore = messages.length > limit;
    const results = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor = hasMore ? results[results.length - 1]?._id : null;

    return {
      messages: results,
      nextCursor,
      hasMore,
    };
  },
});

// Restore message from trash
export const restoreFromTrash = mutation({
  args: {
    trashId: v.id("contact_messages_trash"),
  },
  handler: async (ctx, args) => {
    const trashedMessage = await ctx.db.get(args.trashId);
    if (!trashedMessage) {
      throw new Error("Message not found in trash");
    }

    // Extract fields without trash-specific ones
    const { deletedAt, deletedBy, originalId, _id, ...messageData } =
      trashedMessage;

    // Insert back into main table
    const newId = await ctx.db.insert("contact_messages", {
      ...messageData,
    });

    // Delete from trash
    await ctx.db.delete(args.trashId);

    return { success: true, newId };
  },
});

// Permanently delete message from trash
export const permanentDelete = mutation({
  args: {
    trashId: v.id("contact_messages_trash"),
  },
  handler: async (ctx, args) => {
    const trashedMessage = await ctx.db.get(args.trashId);
    if (!trashedMessage) {
      throw new Error("Message not found in trash");
    }

    await ctx.db.delete(args.trashId);
    return { success: true };
  },
});

// Empty trash
export const emptyTrash = mutation({
  handler: async (ctx) => {
    const trashedMessages = await ctx.db
      .query("contact_messages_trash")
      .collect();

    for (const message of trashedMessages) {
      await ctx.db.delete(message._id);
    }

    return {
      success: true,
      deletedCount: trashedMessages.length,
    };
  },
});

// Create reply email HTML
function createReplyEmailHtml(
  firstName: string,
  reply: string,
  originalMessage: string,
) {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; border-bottom: 3px solid #2563eb; }
    .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
    .original-message { background: #f3f4f6; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0; font-size: 14px; }
    .reply-box { background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #dbeafe; }
    .reply-box h3 { color: #1e40af; margin-top: 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">PharmaCare</div>
    </div>
    <div class="content">
      <h2>Hello ${firstName},</h2>
      <p>Thank you for reaching out to us. We've reviewed your message and here is our response:</p>
      
      <div class="reply-box">
        <h3>Our Response:</h3>
        <p style="white-space: pre-wrap;">${reply}</p>
      </div>
      
      <div class="original-message">
        <strong>Your Original Message:</strong><br>
        <p style="white-space: pre-wrap; margin: 10px 0 0 0;">${originalMessage}</p>
      </div>
      
      <p>If you have any further questions, please don't hesitate to contact us again through our website.</p>
      
      <p>Best regards,<br>
      <strong>The PharmaCare Team</strong></p>
    </div>
    <div class="footer">
      <p>This is an automated response. Please do not reply directly to this email.</p>
      <p>© 2024 PharmaCare Platform. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}
