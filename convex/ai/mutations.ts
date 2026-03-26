// @ts-ignore
import { mutation } from '../_generated/server';
import { v } from 'convex/values';

// Rate limiting: Max messages per user per day
const MAX_DAILY_MESSAGES = 50;
const MESSAGE_COOLDOWN_MS = 5000; // 5 seconds between messages

export const startConversation = mutation({
  args: {
    context: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q: any) =>
        q.eq('tokenIdentifier', identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user already has an active conversation
    const existingConversation = await ctx.db
      .query('ai_conversations')
      .withIndex('by_userId', (q: any) => q.eq('userId', user._id))
      .filter((q: any) => q.eq(q.field('status'), 'active'))
      .first();

    if (existingConversation) {
      return { success: true, conversationId: existingConversation._id };
    }

    const conversationId = await ctx.db.insert('ai_conversations', {
      userId: user._id,
      userRole: user.role,
      messages: [],
      context: args.context || null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'active',
      escalated: false,
      unreadCount: 0,
      lastMessageAt: null,
    });

    return { success: true, conversationId };
  },
});

export const sendMessage = mutation({
  args: {
    userId: v.id('users'),
    role: v.string(),
    assistantResponse: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q: any) =>
        q.eq('tokenIdentifier', identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error('User not found');
    }

    if (user._id !== args.userId) {
      throw new Error('Unauthorized: Not your conversation');
    }

    // Rate limiting: Check daily message count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const userMessagesToday = await ctx.db
      .query('ai_conversations')
      .withIndex('by_userId', (q: any) => q.eq('userId', user._id))
      .filter((q: any) => q.gte(q.field('lastMessageAt'), todayTimestamp))
      .collect();

    const totalMessagesToday = userMessagesToday.reduce(
      (sum: number, conv: any) =>
        sum + (conv.messages?.filter((m: any) => m.role === 'user').length || 0),
      0
    );

    if (totalMessagesToday >= MAX_DAILY_MESSAGES) {
      throw new Error('Daily message limit reached. Please try again tomorrow.');
    }

    // Find or create conversation
    let conversation = await ctx.db
      .query('ai_conversations')
      .withIndex('by_userId', (q: any) => q.eq('userId', user._id))
      .filter((q: any) => q.eq(q.field('status'), 'active'))
      .first();

    if (!conversation) {
      const conversationId = await ctx.db.insert('ai_conversations', {
        userId: user._id,
        userRole: user.role,
        messages: [],
        context: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: 'active',
        escalated: false,
        unreadCount: 0,
        lastMessageAt: Date.now(),
      });
      conversation = await ctx.db.get(conversationId);
    }

    // Add cooldown check
    if (conversation.lastMessageAt) {
      const timeSinceLastMessage = Date.now() - conversation.lastMessageAt;
      if (timeSinceLastMessage < MESSAGE_COOLDOWN_MS) {
        throw new Error('Please wait a moment before sending another message.');
      }
    }

    const updatedMessages = [
      ...conversation.messages,
      { role: 'user', content: args.role, timestamp: Date.now() },
      { role: 'assistant', content: args.assistantResponse, timestamp: Date.now() },
    ];

    await ctx.db.patch(conversation._id, {
      messages: updatedMessages,
      updatedAt: Date.now(),
      lastMessageAt: Date.now(),
      unreadCount: (conversation.unreadCount || 0) + 1,
    });

    // Log to audit trail
    await ctx.db.insert('audit_logs', {
      userId: user._id,
      action: 'ai_conversation_message',
      entityId: conversation._id,
      entityType: 'ai_conversation',
      details: 'AI conversation message sent',
      timestamp: Date.now(),
    });

    return { success: true, conversationId: conversation._id };
  },
});

export const escalateConversation = mutation({
  args: {
    userId: v.id('users'),
    pharmacyId: v.optional(v.id('pharmacies')),
    role: v.string(),
    type: v.union(v.literal('phone'), v.literal('email'), v.literal('complaint')),
    reason: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q: any) =>
        q.eq('tokenIdentifier', identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error('User not found');
    }

    if (user._id !== args.userId) {
      throw new Error('Unauthorized: Not your conversation');
    }

    // Get active conversation
    const conversation = await ctx.db
      .query('ai_conversations')
      .withIndex('by_userId', (q: any) => q.eq('userId', user._id))
      .filter((q: any) => q.eq(q.field('status'), 'active'))
      .first();

    if (!conversation) {
      throw new Error('No active conversation found');
    }

    // Determine routing based on category and role
    let routedTo: string[] = [];
    if (args.category === 'platform' || args.role === 'admin') {
      routedTo = ['admin'];
    } else if (args.category === 'owner') {
      routedTo = ['admin'];
    } else {
      // Complaints about managers/staff/branches go to both owner and admin
      routedTo = ['owner', 'admin'];
    }

    // Generate reference number
    const referenceNumber = `ESC-${Date.now().toString(36).toUpperCase().slice(-6)}-${Math.random().toString(36).substr(2, 3).toUpperCase()}`;

    await ctx.db.patch(conversation._id, {
      escalated: true,
      status: 'escalated',
      updatedAt: Date.now(),
    });

    await ctx.db.insert('ai_escalations', {
      conversationId: conversation._id,
      userId: user._id,
      userRole: user.role,
      pharmacyId: args.pharmacyId || null,
      type: args.type,
      reason: args.reason,
      category: args.category || 'general',
      routedTo,
      referenceNumber,
      messages: conversation.messages,
      escalatedAt: Date.now(),
      status: 'pending',
      resolvedBy: null,
      resolvedAt: null,
      resolution: null,
    });

    // Create notifications for routed parties
    for (const recipient of routedTo) {
      if (recipient === 'admin') {
        // Create admin notification
        await ctx.db.insert('notifications', {
          userId: 'admin', // Special admin notification
          type: 'ai_escalation',
          title: `AI Escalation: ${args.type.toUpperCase()}`,
          message: `New escalation from ${user.role}: ${args.reason}`,
          referenceNumber,
          read: false,
          createdAt: Date.now(),
        });
      } else if (recipient === 'owner' && args.pharmacyId) {
        // Get owner of pharmacy
        const pharmacy = await ctx.db.get(args.pharmacyId);
        if (pharmacy?.ownerId) {
          await ctx.db.insert('notifications', {
            userId: pharmacy.ownerId,
            type: 'ai_escalation',
            title: `Staff Escalation: ${args.type.toUpperCase()}`,
            message: `Escalation from ${user.role}: ${args.reason}`,
            referenceNumber,
            read: false,
            createdAt: Date.now(),
          });
        }
      }
    }

    // Log to audit trail
    await ctx.db.insert('audit_logs', {
      userId: user._id,
      action: 'ai_conversation_escalated',
      entityId: conversation._id,
      entityType: 'ai_conversation',
      details: `Escalated to ${args.type}: ${args.reason} (Ref: ${referenceNumber})`,
      timestamp: Date.now(),
    });

    return {
      success: true,
      referenceNumber,
      routedTo,
    };
  },
});

export const markConversationResolved = mutation({
  args: {
    conversationId: v.id('ai_conversations'),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q: any) =>
        q.eq('tokenIdentifier', identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      throw new Error('User not found');
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (conversation.userId !== user._id) {
      throw new Error('Unauthorized: Not your conversation');
    }

    await ctx.db.patch(args.conversationId, {
      status: 'resolved',
      updatedAt: Date.now(),
      unreadCount: 0,
    });

    return { success: true };
  },
});

export const markMessagesAsRead = mutation({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx: any, args: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q: any) =>
        q.eq('tokenIdentifier', identity.tokenIdentifier)
      )
      .unique();

    if (!user || user._id !== args.userId) {
      throw new Error('Unauthorized');
    }

    const conversation = await ctx.db
      .query('ai_conversations')
      .withIndex('by_userId', (q: any) => q.eq('userId', user._id))
      .filter((q: any) => q.eq(q.field('status'), 'active'))
      .first();

    if (conversation) {
      await ctx.db.patch(conversation._id, {
        unreadCount: 0,
      });
    }

    return { success: true };
  },
});

// Helper function for future OpenAI integration
export const generateAIResponse = mutation({
  args: {
    conversationId: v.id('ai_conversations'),
    userMessage: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    // This mutation would be called from a Convex action
    // that makes the actual API call to OpenAI/Claude
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // In production, this would integrate with real AI API
    // For now, return a placeholder that triggers the mock service
    return {
      success: true,
      message: 'AI response will be generated by client-side service',
    };
  },
});
