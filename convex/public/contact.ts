import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { internal } from "../_generated/api";

const RATE_LIMIT_MINUTES = 60;
const RATE_LIMIT_MS = RATE_LIMIT_MINUTES * 60 * 1000;

// Check rate limit status
export const checkRateLimit = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const rateLimit = await ctx.db
      .query("rate_limits")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!rateLimit) {
      return { canSubmit: true, waitTimeMinutes: 0 };
    }

    const timeSinceLastAttempt = Date.now() - rateLimit.lastAttempt;

    if (timeSinceLastAttempt < RATE_LIMIT_MS) {
      const waitTimeMinutes = Math.ceil(
        (RATE_LIMIT_MS - timeSinceLastAttempt) / (60 * 1000),
      );
      return { canSubmit: false, waitTimeMinutes };
    }

    return { canSubmit: true, waitTimeMinutes: 0 };
  },
});

// Submit contact message
export const submitContactMessage = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    message: v.string(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Invalid email format");
    }

    // Validate message length
    if (args.message.length < 10) {
      throw new Error("Message must be at least 10 characters long");
    }
    if (args.message.length > 2000) {
      throw new Error("Message must be less than 2000 characters");
    }

    // Check rate limit
    const rateLimit = await ctx.db
      .query("rate_limits")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (rateLimit) {
      const timeSinceLastAttempt = Date.now() - rateLimit.lastAttempt;
      if (timeSinceLastAttempt < RATE_LIMIT_MS) {
        const waitTimeMinutes = Math.ceil(
          (RATE_LIMIT_MS - timeSinceLastAttempt) / (60 * 1000),
        );
        throw new Error(
          `Please wait ${waitTimeMinutes} minutes before sending another message`,
        );
      }
    }

    // Save the message
    const messageId = await ctx.db.insert("contact_messages", {
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      message: args.message,
      status: "unread",
      emailSent: false,
      createdAt: Date.now(),
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
    });

    // Update or create rate limit record
    if (rateLimit) {
      await ctx.db.patch(rateLimit._id, {
        lastAttempt: Date.now(),
        attemptCount: rateLimit.attemptCount + 1,
        ipAddress: args.ipAddress || rateLimit.ipAddress,
      });
    } else {
      await ctx.db.insert("rate_limits", {
        email: args.email,
        ipAddress: args.ipAddress || "unknown",
        lastAttempt: Date.now(),
        attemptCount: 1,
      });
    }

    // Get site settings
    const settings = await ctx.db.query("site_settings").first();

    if (settings) {
      try {
        await ctx.scheduler.runAfter(0, internal.lib.email.sendEmail, {
          to: settings.contactEmail,
          subject: "New Contact Message - PharmaCare Platform",
          html: createAdminNotificationHtml(args),
          apiKey: settings.resendApiKey || "",
          testMode: settings.testMode,
        });

        // Update message to mark email as sent
        await ctx.db.patch(messageId, { emailSent: true });
      } catch (error) {
        console.error("Failed to send admin notification:", error);
        // Don't throw - message is still saved
      }
    }

    return {
      success: true,
      messageId,
      message:
        "Your message has been sent successfully! We will review it and get back to you soon.",
    };
  },
});

// Create admin notification HTML
function createAdminNotificationHtml(args: {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
    .message-box { background: #f3f4f6; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>PharmaCare Platform</h1>
    </div>
    <div class="content">
      <h2>New Contact Message Received</h2>
      <p>Hello Admin,</p>
      <p>You've received a new message from the contact form.</p>
      
      <div style="margin: 20px 0;">
        <strong>From:</strong> ${args.firstName} ${args.lastName} (${args.email})<br>
        <strong>Time:</strong> ${new Date().toLocaleString()}
      </div>
      
      <div class="message-box">
        <strong>Message:</strong><br>
        ${args.message.substring(0, 200)}${args.message.length > 200 ? "..." : ""}
      </div>
      
      <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
        This is an automated notification from your PharmaCare platform.
      </p>
    </div>
    <div class="footer">
      <p>© 2024 PharmaCare Platform. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}
