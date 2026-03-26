// @ts-ignore
import { v } from 'convex/values';
import { query, mutation } from '../_generated/server';

// Get all testimonials with filters (admin)
export const getTestimonials = query({
  args: {
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }

    // Verify admin role
    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .first();

    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized: Admin only');
    }

    let queryBuilder = ctx.db.query('testimonials');

    if (args.status) {
      queryBuilder = queryBuilder.withIndex('by_status', (q) => q.eq('status', args.status));
    }

    const testimonials = await queryBuilder.take(args.limit || 50);

    // Fetch owner and pharmacy details for each testimonial
    const enrichedTestimonials = await Promise.all(
      testimonials.map(async (t) => {
        const owner = await ctx.db.get(t.ownerId);
        const pharmacy = await ctx.db.get(t.pharmacyId);
        const reviewer = t.reviewedBy ? await ctx.db.get(t.reviewedBy) : null;

        return {
          ...t,
          ownerEmail: owner?.email,
          ownerFullName: owner?.full_name,
          pharmacyName: pharmacy?.name,
          reviewerName: reviewer?.full_name,
        };
      })
    );

    return enrichedTestimonials;
  },
});

// Get testimonial statistics (admin)
export const getTestimonialStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }

    // Verify admin role
    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .first();

    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized: Admin only');
    }

    const allTestimonials = await ctx.db.query('testimonials').collect();

    const stats = {
      total: allTestimonials.length,
      pending: allTestimonials.filter((t) => t.status === 'pending').length,
      approved: allTestimonials.filter((t) => t.status === 'approved').length,
      rejected: allTestimonials.filter((t) => t.status === 'rejected').length,
      avgRating:
        allTestimonials.length > 0
          ? allTestimonials.reduce((sum, t) => sum + t.starRating, 0) / allTestimonials.length
          : 0,
    };

    return stats;
  },
});

// Get a single testimonial by ID (admin)
export const getTestimonialById = query({
  args: {
    testimonialId: v.id('testimonials'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }

    // Verify admin role
    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .first();

    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized: Admin only');
    }

    const testimonial = await ctx.db.get(args.testimonialId);

    if (!testimonial) {
      throw new Error('Testimonial not found');
    }

    const owner = await ctx.db.get(testimonial.ownerId);
    const pharmacy = await ctx.db.get(testimonial.pharmacyId);
    const reviewer = testimonial.reviewedBy ? await ctx.db.get(testimonial.reviewedBy) : null;

    return {
      ...testimonial,
      ownerEmail: owner?.email,
      ownerFullName: owner?.full_name,
      pharmacyName: pharmacy?.name,
      reviewerName: reviewer?.full_name,
    };
  },
});

// Approve a testimonial
export const approveTestimonial = mutation({
  args: {
    testimonialId: v.id('testimonials'),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }

    // Verify admin role
    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .first();

    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized: Admin only');
    }

    const testimonial = await ctx.db.get(args.testimonialId);

    if (!testimonial) {
      throw new Error('Testimonial not found');
    }

    if (testimonial.status !== 'pending') {
      throw new Error('Testimonial is not pending approval');
    }

    await ctx.db.patch(args.testimonialId, {
      status: 'approved',
      reviewedAt: Date.now(),
      reviewedBy: user._id,
      adminNotes: args.adminNotes,
    });

    return { success: true, message: 'Testimonial approved successfully' };
  },
});

// Reject a testimonial
export const rejectTestimonial = mutation({
  args: {
    testimonialId: v.id('testimonials'),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }

    // Verify admin role
    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .first();

    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized: Admin only');
    }

    const testimonial = await ctx.db.get(args.testimonialId);

    if (!testimonial) {
      throw new Error('Testimonial not found');
    }

    if (testimonial.status !== 'pending') {
      throw new Error('Testimonial is not pending approval');
    }

    await ctx.db.patch(args.testimonialId, {
      status: 'rejected',
      reviewedAt: Date.now(),
      reviewedBy: user._id,
      adminNotes: args.reason,
    });

    return { success: true, message: 'Testimonial rejected' };
  },
});

// Update an approved testimonial (admin edit)
export const updateTestimonial = mutation({
  args: {
    testimonialId: v.id('testimonials'),
    content: v.optional(v.string()),
    starRating: v.optional(v.number()),
    displayOrder: v.optional(v.number()),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }

    // Verify admin role
    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .first();

    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized: Admin only');
    }

    const testimonial = await ctx.db.get(args.testimonialId);

    if (!testimonial) {
      throw new Error('Testimonial not found');
    }

    if (testimonial.status !== 'approved') {
      throw new Error('Only approved testimonials can be edited');
    }

    const updates: any = {};
    if (args.content !== undefined) updates.content = args.content;
    if (args.starRating !== undefined) updates.starRating = args.starRating;
    if (args.displayOrder !== undefined) updates.displayOrder = args.displayOrder;
    if (args.adminNotes !== undefined) updates.adminNotes = args.adminNotes;

    await ctx.db.patch(args.testimonialId, updates);

    return { success: true, message: 'Testimonial updated successfully' };
  },
});

// Delete a testimonial (admin)
export const deleteTestimonial = mutation({
  args: {
    testimonialId: v.id('testimonials'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }

    // Verify admin role
    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .first();

    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized: Admin only');
    }

    const testimonial = await ctx.db.get(args.testimonialId);

    if (!testimonial) {
      throw new Error('Testimonial not found');
    }

    await ctx.db.delete(args.testimonialId);

    return { success: true, message: 'Testimonial deleted successfully' };
  },
});

// Reorder testimonials
export const reorderTestimonials = mutation({
  args: {
    testimonialIds: v.array(v.id('testimonials')),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Unauthorized');
    }

    // Verify admin role
    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .first();

    if (!user || user.role !== 'admin') {
      throw new Error('Unauthorized: Admin only');
    }

    for (let i = 0; i < args.testimonialIds.length; i++) {
      const testimonial = await ctx.db.get(args.testimonialIds[i]);

      if (testimonial && testimonial.status === 'approved') {
        await ctx.db.patch(args.testimonialIds[i], {
          displayOrder: i,
        });
      }
    }

    return { success: true };
  },
});
