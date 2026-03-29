// @ts-ignore
import { v } from "convex/values";
import { query, mutation } from "../_generated/server";

const FALLBACK_SECTION_CONTENT: Record<string, Record<string, unknown>> = {
  hero: {
    heroTitle: "Modern Pharmacy Management Built for Ethiopian Pharmacies",
    heroSubtitle:
      "Multi-branch operations, automated inventory, and prescription safety all in one platform",
    heroDescription:
      "Streamline your pharmacy operations with real-time inventory tracking, prescription workflows, and secure payments.",
    heroCtaText: "Get Started",
    heroCtaSecondaryText: "Learn More",
  },
  services: {
    servicesTitle: "Complete Pharmacy Management Suite",
    servicesSubtitle:
      "From inventory to prescription processing, PharmaCare covers day-to-day operations end to end.",
  },
  features: {
    featuresTitle: "Why Choose PharmaCare?",
    featuresSubtitle:
      "Built for reliability, security, and speed across single and multi-branch pharmacies.",
  },
  testimonials: {
    testimonialsTitle: "What Pharmacy Owners Say",
    testimonialsSubtitle:
      "Real feedback from teams using PharmaCare every day.",
  },
};

// Get all public landing page content (no auth required)
export const getLandingPageContent = query({
  handler: async (ctx) => {
    const content = await ctx.db
      .query("landing_page_content")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    const sections = await ctx.db
      .query("landing_page_sections")
      .withIndex("by_enabled", (q) => q.eq("isEnabled", true))
      .collect();

    // Build content map
    const contentMap: Record<string, any> = {};
    for (const item of content) {
      contentMap[item.sectionKey] = item.content;
    }

    return {
      content: contentMap,
      sections: sections.map((s) => ({
        sectionId: s.sectionId,
        name: s.name,
        displayName: s.displayName,
        displayOrder: s.displayOrder,
      })),
    };
  },
});

// Get specific section content (public)
export const getLandingPageSection = query({
  args: {
    sectionKey: v.string(),
  },
  handler: async (ctx, args) => {
    const section = await ctx.db
      .query("landing_page_content")
      .withIndex("by_section_key", (q) => q.eq("sectionKey", args.sectionKey))
      .first();

    if (section?.content) {
      return section.content;
    }

    return FALLBACK_SECTION_CONTENT[args.sectionKey] || null;
  },
});

// Get approved testimonials for landing page (public)
export const getApprovedTestimonials = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const testimonials = await ctx.db
      .query("testimonials")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .take(args.limit || 6);

    // Get pharmacy names
    const enrichedTestimonials = await Promise.all(
      testimonials.map(async (t) => {
        const pharmacy = await ctx.db.get(t.pharmacyId);

        return {
          _id: t._id,
          ownerName: t.ownerName,
          pharmacyName: pharmacy?.name || t.pharmacyName,
          profilePhotoUrl: t.profilePhotoUrl,
          content: t.content,
          starRating: t.starRating,
          submittedAt: t.submittedAt,
        };
      }),
    );

    return enrichedTestimonials;
  },
});

// Get about page content (public)
export const getAboutPageContent = query({
  handler: async (ctx) => {
    const aboutContent = await ctx.db
      .query("landing_page_content")
      .withIndex("by_section_key", (q) => q.eq("sectionKey", "about"))
      .first();

    const stats = await ctx.db.query("landing_page_analytics_daily").collect();

    // Calculate some stats for display
    const totalViews = stats.reduce((sum: number, s: any) => sum + s.views, 0);
    const totalTestimonials = await ctx.db
      .query("testimonials")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .collect()
      .then((t: any[]) => t.length);

    return {
      about: aboutContent?.content || null,
      stats: {
        totalViews,
        approvedTestimonials: totalTestimonials,
      },
    };
  },
});

// Track landing page section view (public)
export const trackSectionView = mutation({
  args: {
    sectionId: v.optional(v.string()),
    sessionId: v.string(),
    userAgent: v.optional(v.string()),
    referrer: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("landing_page_analytics", {
      sessionId: args.sessionId,
      sectionId: args.sectionId,
      eventType: "view",
      userAgent: args.userAgent,
      referrer: args.referrer,
      timestamp: Date.now(),
    });

    // Update daily stats
    const today = new Date().toISOString().split("T")[0];
    const existingStats = await ctx.db
      .query("landing_page_analytics_daily")
      .withIndex("by_date", (q) => q.eq("date", today))
      .first();

    if (existingStats) {
      await ctx.db.patch(existingStats._id, {
        views: existingStats.views + 1,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("landing_page_analytics_daily", {
        date: today,
        sectionId: args.sectionId || "general",
        views: 1,
        uniqueVisitors: 1,
        clicks: 0,
        interactions: 0,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Track landing page interaction (public)
export const trackInteraction = mutation({
  args: {
    sectionId: v.optional(v.string()),
    eventType: v.string(), // 'click', 'interaction', 'scroll'
    elementId: v.optional(v.string()),
    elementType: v.optional(v.string()),
    sessionId: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("landing_page_analytics", {
      sessionId: args.sessionId,
      sectionId: args.sectionId,
      eventType: args.eventType,
      eventData: {
        elementId: args.elementId,
        elementType: args.elementType,
        metadata: args.metadata,
      },
      timestamp: Date.now(),
    });

    // Update daily stats
    const today = new Date().toISOString().split("T")[0];
    const existingStats = await ctx.db
      .query("landing_page_analytics_daily")
      .withIndex("by_section_date", (q) =>
        q.eq("sectionId", args.sectionId || "general").eq("date", today),
      )
      .first();

    if (existingStats) {
      const updates: any = { updatedAt: Date.now() };
      if (args.eventType === "click") {
        updates.clicks = existingStats.clicks + 1;
      } else if (args.eventType === "interaction") {
        updates.interactions = existingStats.interactions + 1;
      }
      await ctx.db.patch(existingStats._id, updates);
    }

    return { success: true };
  },
});
