import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { internal } from "../_generated/api";

// Default settings
const DEFAULT_SETTINGS = {
  contactEmail: "daggi.x02@gmail.com",
  contactPhone: "+251 947471516",
  contactAddress: "Ethiopia, Addis Ababa",
  emailProvider: "resend",
  resendApiKey: "",
  testMode: true,
};

// Get or create site settings (public - for landing page)
export const getSiteSettings = query({
  handler: async (ctx) => {
    const settings = await ctx.db.query("site_settings").first();

    if (!settings) {
      // Return defaults if no settings exist
      return {
        ...DEFAULT_SETTINGS,
        updatedAt: Date.now(),
      };
    }

    // Never return the actual API key to the client
    return {
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      contactAddress: settings.contactAddress,
      emailProvider: settings.emailProvider,
      testMode: settings.testMode,
      updatedAt: settings.updatedAt,
    };
  },
});

// Get full settings including API key (admin only)
export const getSiteSettingsAdmin = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx) => {
    const settings = await ctx.db.query("site_settings").first();

    if (!settings) {
      return {
        ...DEFAULT_SETTINGS,
        updatedAt: Date.now(),
        isInitial: true,
      };
    }

    return settings;
  },
});

// Update site settings (admin only)
export const updateSiteSettings = mutation({
  args: {
    contactEmail: v.string(),
    contactPhone: v.optional(v.string()),
    contactAddress: v.optional(v.string()),
    resendApiKey: v.optional(v.string()),
    testMode: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("site_settings").first();

    const settingsData = {
      contactEmail: args.contactEmail,
      contactPhone: args.contactPhone || "",
      contactAddress: args.contactAddress || "",
      emailProvider: "resend",
      resendApiKey: args.resendApiKey || existing?.resendApiKey || "",
      testMode: args.testMode,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, settingsData);
      return { ...settingsData, _id: existing._id };
    } else {
      const newId = await ctx.db.insert("site_settings", settingsData);
      return { ...settingsData, _id: newId };
    }
  },
});

// Toggle test mode quickly
export const toggleTestMode = mutation({
  args: {
    testMode: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("site_settings").first();

    if (!existing) {
      throw new Error("Site settings not found");
    }

    await ctx.db.patch(existing._id, {
      testMode: args.testMode,
      updatedAt: Date.now(),
    });

    return { success: true, testMode: args.testMode };
  },
});

// Send test email
export const sendTestEmail = mutation({
  args: {
    to: v.string(),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db.query("site_settings").first();

    if (!settings || !settings.resendApiKey) {
      throw new Error("Email service not configured");
    }

    return await ctx.runAction(internal.lib.email.sendTestEmail, {
      to: args.to,
      apiKey: settings.resendApiKey,
      testMode: settings.testMode,
    });
  },
});
