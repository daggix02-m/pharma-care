// @ts-ignore
import { v } from "convex/values";
import { query, mutation } from "../_generated/server";
import { requireAdmin } from "../lib/auth";

// Default landing page content - Accurate Ethiopia-focused content
const DEFAULT_LANDING_PAGE_CONTENT = {
  hero: {
    heroTitle: "Modern Pharmacy Management Built for Ethiopian Pharmacies",
    heroSubtitle:
      "Multi-branch operations, automated inventory, and prescription safety—all in one powerful platform",
    heroDescription:
      "Streamline your pharmacy operations with real-time inventory tracking, smart prescription workflows, and integrated Chapa payments. Whether you run a single pharmacy or a nationwide chain, PharmaCare scales with your business.",
    heroCtaText: "Get Started Free",
    heroCtaSecondaryText: "Watch Demo",
    heroBackgroundImage: "",
  },
  services: {
    servicesTitle: "Complete Pharmacy Management Suite",
    servicesSubtitle:
      "From inventory tracking to prescription processing, our comprehensive platform covers every aspect of modern pharmacy operations.",
    services: [
      {
        id: "inventory",
        icon: "Package",
        title: "Multi-Branch Inventory",
        description:
          "Real-time stock tracking across unlimited branches with automated alerts for low stock and expiring medications.",
        features: [
          "Real-time stock synchronization across all branches",
          "Automated low-stock alerts with configurable thresholds",
          "Expiry warnings (30-day advance notice)",
          "Batch tracking with FIFO support",
          "Cross-branch stock transfers",
          "Barcode scanning support",
        ],
      },
      {
        id: "prescriptions",
        icon: "FileText",
        title: "Digital Prescription Workflow",
        description:
          "Process prescriptions safely with built-in clinical checks, patient history tracking, and refill management.",
        features: [
          "Drug interaction warnings (amber alerts)",
          "Patient allergy tracking and alerts",
          "Complete medication history",
          "Prescription refill management",
          "Controlled substance double-authorization",
          "Dosage limit enforcement",
        ],
      },
      {
        id: "sales",
        icon: "ShoppingCart",
        title: "Integrated POS System",
        description:
          "Complete point-of-sale with Chapa integration, multiple payment methods, and automated receipt generation.",
        features: [
          "Chapa mobile payment integration",
          "Multiple payment methods (Cash, Card, Mobile, Bank Transfer)",
          "Split payment support",
          "Insurance co-payment handling",
          "Automated receipt generation",
          "Returns and refund processing",
        ],
      },
      {
        id: "staff",
        icon: "Users",
        title: "Role-Based Access Control",
        description:
          "Manage your team with granular permissions. From owners to cashiers, everyone gets exactly the access they need.",
        features: [
          "5-tier role hierarchy (Admin, Owner, Manager, Pharmacist, Cashier)",
          "Branch-specific access control",
          "Staff performance tracking",
          "Shift management and session tracking",
          "Comprehensive audit trails",
          "Account flagging and locking",
        ],
      },
      {
        id: "ai",
        icon: "Brain",
        title: "AI-Powered Assistance",
        description:
          "Get instant, context-aware help on every page. Our AI assistant understands your role and provides relevant guidance.",
        features: [
          "Role-scoped contextual assistance",
          "50 AI queries per day per user",
          "Context-aware suggestions",
          "Automatic escalation for urgent issues",
          "Conversation history tracking",
          "Ready for advanced AI integration",
        ],
      },
      {
        id: "compliance",
        icon: "Shield",
        title: "Enterprise Security & Compliance",
        description:
          "Bank-level security with comprehensive audit trails, ensuring your pharmacy meets regulatory requirements.",
        features: [
          "Comprehensive audit trails (24-60 month retention)",
          "Bank-level encryption (Clerk authentication)",
          "Controlled substance tracking",
          "License management per branch",
          "Diagnostic session logging",
          "MFA support",
        ],
      },
    ],
  },
  features: {
    featuresTitle: "Why Choose PharmaCare?",
    featuresSubtitle:
      "Built specifically for the Ethiopian market with features that address local pharmacy needs.",
    features: [
      {
        id: "cloud",
        icon: "Cloud",
        title: "Cloud-Based Platform",
        description:
          "Access your pharmacy data from anywhere with internet. No local servers needed. Real-time updates across all devices with 99.9% uptime.",
      },
      {
        id: "ethiopia",
        icon: "MapPin",
        title: "Built for Ethiopia",
        description:
          "Native Chapa integration for mobile payments, local compliance support, and pricing in Ethiopian Birr. Designed with Ethiopian pharmacies in mind.",
      },
      {
        id: "mobile",
        icon: "Smartphone",
        title: "Mobile-Ready",
        description:
          "Works perfectly on tablets and phones. Touch-friendly interfaces for pharmacy counters. Manage your business on-the-go.",
      },
      {
        id: "communication",
        icon: "MessageSquare",
        title: "Built-in Messaging",
        description:
          "Admin broadcast messages to all pharmacy owners, owner-to-staff internal messaging, and automated email notifications via Resend.",
      },
    ],
  },
  cta: {
    ctaTitle: "Ready to Modernize Your Pharmacy?",
    ctaDescription:
      "Join pharmacies across Ethiopia using PharmaCare to streamline operations and improve patient care. Contact us for pricing and a personalized demo.",
    ctaPrimaryButton: "Contact Us",
    ctaSecondaryButton: "Schedule Demo",
  },
  about: {
    aboutMission:
      "To empower pharmacies across Ethiopia with modern, cloud-based technology that simplifies operations, enhances patient safety, and drives business growth. We believe every pharmacy deserves access to world-class management tools.",
    aboutVision:
      "To become the leading pharmacy management platform in Africa, setting new standards for efficiency, compliance, and patient safety in healthcare. We envision a future where technology enables pharmacists to focus on what matters most—patient care.",
    aboutValues: [
      "Innovation - Constantly improving our platform",
      "Security - Bank-level protection for your data",
      "Reliability - 99.9% uptime guarantee",
      "Customer Success - Your growth is our priority",
      "Compliance - Meeting regulatory requirements",
      "Accessibility - Technology for pharmacies of all sizes",
    ],
    aboutStory:
      "PharmaCare was born from a simple observation: Ethiopian pharmacies needed better tools to manage their growing operations. What started as a solution for inventory management has grown into a comprehensive platform serving pharmacies nationwide. Today, we help independent pharmacies and multi-branch chains streamline their operations with modern, cloud-based technology designed specifically for the Ethiopian market.",
  },
  testimonials: {
    testimonialsTitle: "What Pharmacy Owners Say",
    testimonialsSubtitle:
      "Real feedback from pharmacy owners using PharmaCare to grow their business.",
    testimonialsButtonText: "Share Your Experience",
  },
};

const DEFAULT_SECTIONS = [
  {
    sectionId: "hero",
    name: "hero",
    displayName: "Hero Section",
    description: "Main banner with CTA",
    isEnabled: true,
    displayOrder: 1,
    analyticsEnabled: true,
  },
  {
    sectionId: "services",
    name: "services",
    displayName: "Services Section",
    description: "Feature highlights",
    isEnabled: true,
    displayOrder: 2,
    analyticsEnabled: true,
  },
  {
    sectionId: "features",
    name: "features",
    displayName: "Features Section",
    description: "Key features showcase",
    isEnabled: true,
    displayOrder: 3,
    analyticsEnabled: true,
  },
  {
    sectionId: "testimonials",
    name: "testimonials",
    displayName: "Testimonials Section",
    description: "Customer testimonials",
    isEnabled: true,
    displayOrder: 4,
    analyticsEnabled: true,
  },
  {
    sectionId: "cta",
    name: "cta",
    displayName: "CTA Section",
    description: "Call to action",
    isEnabled: true,
    displayOrder: 5,
    analyticsEnabled: true,
  },
  {
    sectionId: "contact",
    name: "contact",
    displayName: "Contact Section",
    description: "Contact form",
    isEnabled: true,
    displayOrder: 6,
    analyticsEnabled: true,
  },
];

// Helper function to check admin auth
async function checkAdminAuth(ctx: any, sessionToken?: string) {
  return await requireAdmin(ctx, sessionToken);
}

// Initialize default landing page content
export const initializeLandingPageContent = mutation({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await checkAdminAuth(ctx, args.sessionToken);

    const existing = await ctx.db.query("landing_page_content").first();

    if (!existing) {
      // Create default content for each section
      for (const [sectionKey, content] of Object.entries(
        DEFAULT_LANDING_PAGE_CONTENT,
      )) {
        await ctx.db.insert("landing_page_content", {
          sectionKey,
          version: 1,
          isActive: true,
          content: content as any,
          updatedAt: Date.now(),
        });
      }
    }

    // Initialize sections
    const existingSections = await ctx.db
      .query("landing_page_sections")
      .collect();
    if (existingSections.length === 0) {
      for (const section of DEFAULT_SECTIONS) {
        await ctx.db.insert("landing_page_sections", {
          ...section,
          lastUpdated: Date.now(),
        });
      }
    }

    return { success: true, message: "Landing page content initialized" };
  },
});

// Get all landing page content (admin)
export const getLandingPageContentAdmin = query({
  args: {
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await checkAdminAuth(ctx, args.sessionToken);

    const content = await ctx.db.query("landing_page_content").collect();
    const sections = await ctx.db.query("landing_page_sections").collect();

    return { content, sections };
  },
});

// Get specific section content (admin)
export const getLandingPageSectionAdmin = query({
  args: {
    sectionKey: v.string(),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await checkAdminAuth(ctx, args.sessionToken);

    const section = await ctx.db
      .query("landing_page_content")
      .withIndex("by_section_key", (q) => q.eq("sectionKey", args.sectionKey))
      .first();

    return section;
  },
});

// Update hero section
export const updateHeroSection = mutation({
  args: {
    heroTitle: v.string(),
    heroSubtitle: v.string(),
    heroDescription: v.string(),
    heroCtaText: v.string(),
    heroCtaSecondaryText: v.string(),
    heroBackgroundImage: v.optional(v.string()),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await checkAdminAuth(ctx, args.sessionToken);

    const existing = await ctx.db
      .query("landing_page_content")
      .withIndex("by_section_key", (q) => q.eq("sectionKey", "hero"))
      .first();

    const contentData = {
      heroTitle: args.heroTitle,
      heroSubtitle: args.heroSubtitle,
      heroDescription: args.heroDescription,
      heroCtaText: args.heroCtaText,
      heroCtaSecondaryText: args.heroCtaSecondaryText,
      heroBackgroundImage: args.heroBackgroundImage || "",
    };

    if (existing) {
      await ctx.db.patch(existing._id, {
        content: {
          ...existing.content,
          ...contentData,
        },
        version: existing.version + 1,
        updatedAt: Date.now(),
        updatedBy: user._id,
      });
    } else {
      await ctx.db.insert("landing_page_content", {
        sectionKey: "hero",
        version: 1,
        isActive: true,
        content: contentData,
        updatedAt: Date.now(),
        updatedBy: user._id,
      });
    }

    return { success: true };
  },
});

// Update services section
export const updateServicesSection = mutation({
  args: {
    servicesTitle: v.string(),
    servicesSubtitle: v.string(),
    services: v.array(
      v.object({
        id: v.string(),
        icon: v.string(),
        title: v.string(),
        description: v.string(),
        features: v.optional(v.array(v.string())),
      }),
    ),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await checkAdminAuth(ctx, args.sessionToken);

    const existing = await ctx.db
      .query("landing_page_content")
      .withIndex("by_section_key", (q) => q.eq("sectionKey", "services"))
      .first();

    const contentData = {
      servicesTitle: args.servicesTitle,
      servicesSubtitle: args.servicesSubtitle,
      services: args.services,
    };

    if (existing) {
      await ctx.db.patch(existing._id, {
        content: {
          ...existing.content,
          ...contentData,
        },
        version: existing.version + 1,
        updatedAt: Date.now(),
        updatedBy: user._id,
      });
    } else {
      await ctx.db.insert("landing_page_content", {
        sectionKey: "services",
        version: 1,
        isActive: true,
        content: contentData,
        updatedAt: Date.now(),
        updatedBy: user._id,
      });
    }

    return { success: true };
  },
});

// Update features section
export const updateFeaturesSection = mutation({
  args: {
    featuresTitle: v.string(),
    featuresSubtitle: v.string(),
    features: v.array(
      v.object({
        id: v.string(),
        icon: v.string(),
        title: v.string(),
        description: v.string(),
      }),
    ),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await checkAdminAuth(ctx, args.sessionToken);

    const existing = await ctx.db
      .query("landing_page_content")
      .withIndex("by_section_key", (q) => q.eq("sectionKey", "features"))
      .first();

    const contentData = {
      featuresTitle: args.featuresTitle,
      featuresSubtitle: args.featuresSubtitle,
      features: args.features,
    };

    if (existing) {
      await ctx.db.patch(existing._id, {
        content: {
          ...existing.content,
          ...contentData,
        },
        version: existing.version + 1,
        updatedAt: Date.now(),
        updatedBy: user._id,
      });
    } else {
      await ctx.db.insert("landing_page_content", {
        sectionKey: "features",
        version: 1,
        isActive: true,
        content: contentData,
        updatedAt: Date.now(),
        updatedBy: user._id,
      });
    }

    return { success: true };
  },
});

// Update CTA section
export const updateCTASection = mutation({
  args: {
    ctaTitle: v.string(),
    ctaDescription: v.string(),
    ctaPrimaryButton: v.string(),
    ctaSecondaryButton: v.string(),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await checkAdminAuth(ctx, args.sessionToken);

    const existing = await ctx.db
      .query("landing_page_content")
      .withIndex("by_section_key", (q) => q.eq("sectionKey", "cta"))
      .first();

    const contentData = {
      ctaTitle: args.ctaTitle,
      ctaDescription: args.ctaDescription,
      ctaPrimaryButton: args.ctaPrimaryButton,
      ctaSecondaryButton: args.ctaSecondaryButton,
    };

    if (existing) {
      await ctx.db.patch(existing._id, {
        content: {
          ...existing.content,
          ...contentData,
        },
        version: existing.version + 1,
        updatedAt: Date.now(),
        updatedBy: user._id,
      });
    } else {
      await ctx.db.insert("landing_page_content", {
        sectionKey: "cta",
        version: 1,
        isActive: true,
        content: contentData,
        updatedAt: Date.now(),
        updatedBy: user._id,
      });
    }

    return { success: true };
  },
});

// Update about section
export const updateAboutSection = mutation({
  args: {
    aboutMission: v.string(),
    aboutVision: v.string(),
    aboutValues: v.array(v.string()),
    aboutStory: v.string(),
    aboutStats: v.array(
      v.object({
        label: v.string(),
        value: v.string(),
        description: v.optional(v.string()),
      }),
    ),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await checkAdminAuth(ctx, args.sessionToken);

    const existing = await ctx.db
      .query("landing_page_content")
      .withIndex("by_section_key", (q) => q.eq("sectionKey", "about"))
      .first();

    const contentData = {
      aboutMission: args.aboutMission,
      aboutVision: args.aboutVision,
      aboutValues: args.aboutValues,
      aboutStory: args.aboutStory,
      aboutStats: args.aboutStats,
    };

    if (existing) {
      await ctx.db.patch(existing._id, {
        content: {
          ...existing.content,
          ...contentData,
        },
        version: existing.version + 1,
        updatedAt: Date.now(),
        updatedBy: user._id,
      });
    } else {
      await ctx.db.insert("landing_page_content", {
        sectionKey: "about",
        version: 1,
        isActive: true,
        content: contentData,
        updatedAt: Date.now(),
        updatedBy: user._id,
      });
    }

    return { success: true };
  },
});

// Update testimonials section
export const updateTestimonialsSection = mutation({
  args: {
    testimonialsTitle: v.string(),
    testimonialsSubtitle: v.string(),
    testimonialsButtonText: v.string(),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await checkAdminAuth(ctx, args.sessionToken);

    const existing = await ctx.db
      .query("landing_page_content")
      .withIndex("by_section_key", (q) => q.eq("sectionKey", "testimonials"))
      .first();

    const contentData = {
      testimonialsTitle: args.testimonialsTitle,
      testimonialsSubtitle: args.testimonialsSubtitle,
      testimonialsButtonText: args.testimonialsButtonText,
    };

    if (existing) {
      await ctx.db.patch(existing._id, {
        content: {
          ...existing.content,
          ...contentData,
        },
        version: existing.version + 1,
        updatedAt: Date.now(),
        updatedBy: user._id,
      });
    } else {
      await ctx.db.insert("landing_page_content", {
        sectionKey: "testimonials",
        version: 1,
        isActive: true,
        content: contentData,
        updatedAt: Date.now(),
        updatedBy: user._id,
      });
    }

    return { success: true };
  },
});

// Toggle section visibility
export const toggleSectionVisibility = mutation({
  args: {
    sectionId: v.string(),
    isEnabled: v.boolean(),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await checkAdminAuth(ctx, args.sessionToken);

    const section = await ctx.db
      .query("landing_page_sections")
      .filter((q) => q.eq(q.field("sectionId"), args.sectionId))
      .first();

    if (!section) {
      throw new Error("Section not found");
    }

    await ctx.db.patch(section._id, {
      isEnabled: args.isEnabled,
      lastUpdated: Date.now(),
      updatedBy: user._id,
    });

    return {
      success: true,
      sectionId: args.sectionId,
      isEnabled: args.isEnabled,
    };
  },
});

// Reorder sections
export const reorderSections = mutation({
  args: {
    orderedIds: v.array(v.string()),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await checkAdminAuth(ctx, args.sessionToken);

    for (let i = 0; i < args.orderedIds.length; i++) {
      const section = await ctx.db
        .query("landing_page_sections")
        .filter((q) => q.eq(q.field("sectionId"), args.orderedIds[i]))
        .first();

      if (section) {
        await ctx.db.patch(section._id, {
          displayOrder: i + 1,
          lastUpdated: Date.now(),
          updatedBy: user._id,
        });
      }
    }

    return { success: true };
  },
});

// Get landing page analytics summary
export const getLandingPageAnalytics = query({
  args: {
    days: v.optional(v.number()),
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await checkAdminAuth(ctx, args.sessionToken);

    const days = args.days || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const analytics = await ctx.db
      .query("landing_page_analytics")
      .withIndex("by_timestamp", (q) =>
        q.gte("timestamp", cutoffDate.getTime()),
      )
      .collect();

    const sectionStats: Record<
      string,
      { views: number; clicks: number; interactions: number }
    > = {};

    for (const event of analytics) {
      const sectionId = event.sectionId || "general";
      if (!sectionStats[sectionId]) {
        sectionStats[sectionId] = { views: 0, clicks: 0, interactions: 0 };
      }

      if (event.eventType === "view") sectionStats[sectionId].views++;
      if (event.eventType === "click") sectionStats[sectionId].clicks++;
      if (event.eventType === "interaction")
        sectionStats[sectionId].interactions++;
    }

    return {
      totalEvents: analytics.length,
      sectionStats,
      period: days,
    };
  },
});
