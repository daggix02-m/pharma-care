// @ts-ignore
import { v } from "convex/values";
import { query, mutation } from "../_generated/server";

// Submit a new testimonial (owner)
export const submitTestimonial = mutation({
  args: {
    content: v.string(),
    starRating: v.number(),
    profilePhotoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== "owner") {
      throw new Error("Only pharmacy owners can submit testimonials");
    }

    const pharmacy = await ctx.db
      .query("pharmacies")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .first();

    if (!pharmacy) {
      throw new Error("Pharmacy not found");
    }

    // Check if user already has a pending or approved testimonial
    const existingTestimonial = await ctx.db
      .query("testimonials")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "pending"),
          q.eq(q.field("status"), "approved"),
        ),
      )
      .first();

    if (existingTestimonial) {
      throw new Error("You already have a testimonial pending or approved");
    }

    // Validate content length
    if (args.content.length < 50) {
      throw new Error("Testimonial must be at least 50 characters");
    }

    if (args.content.length > 1000) {
      throw new Error("Testimonial must not exceed 1000 characters");
    }

    // Validate star rating
    if (args.starRating < 1 || args.starRating > 5) {
      throw new Error("Star rating must be between 1 and 5");
    }

    const testimonialId = await ctx.db.insert("testimonials", {
      ownerId: user._id,
      pharmacyId: pharmacy._id,
      ownerName: user.full_name,
      pharmacyName: pharmacy.name,
      profilePhotoUrl: args.profilePhotoUrl,
      content: args.content,
      starRating: args.starRating,
      status: "pending",
      submittedAt: Date.now(),
      displayOrder: 999, // Will be set when approved
    });

    return {
      success: true,
      testimonialId,
      message: "Testimonial submitted successfully and is pending approval",
    };
  },
});

// Get owners testimonials
export const getMyTestimonials = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== "owner") {
      throw new Error("Only pharmacy owners can view testimonials");
    }

    const testimonials = await ctx.db
      .query("testimonials")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();

    return testimonials;
  },
});

// Check if owner can submit a testimonial
export const canSubmitTestimonial = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { canSubmit: false, reason: "Not authenticated" };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .first();

    if (!user || user.role !== "owner") {
      return {
        canSubmit: false,
        reason: "Only owners can submit testimonials",
      };
    }

    const pharmacy = await ctx.db
      .query("pharmacies")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .first();

    if (!pharmacy) {
      return { canSubmit: false, reason: "No pharmacy found" };
    }

    const existingTestimonial = await ctx.db
      .query("testimonials")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "pending"),
          q.eq(q.field("status"), "approved"),
        ),
      )
      .first();

    if (existingTestimonial) {
      return {
        canSubmit: false,
        reason: "You already have a testimonial pending or approved",
        existingTestimonial,
      };
    }

    return { canSubmit: true };
  },
});

// Get submission guidelines
export const getTestimonialGuidelines = query({
  handler: async () => {
    return {
      minLength: 50,
      maxLength: 1000,
      minRating: 1,
      maxRating: 5,
      guidelines: [
        "Share your honest experience with PharmaCare",
        "Mention specific features or benefits you enjoyed",
        "Keep it professional and respectful",
        "Avoid including personal patient information",
        "Your testimonial will be reviewed before being published",
      ],
    };
  },
});
