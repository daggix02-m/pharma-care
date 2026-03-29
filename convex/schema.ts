import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    // Convex Auth compatible fields
    tokenIdentifier: v.optional(v.string()), // For backward compatibility during migration
    email: v.string(),
    emailVerified: v.optional(v.boolean()),
    name: v.optional(v.string()),
    image: v.optional(v.string()),

    // Application-specific fields
    full_name: v.string(),
    role: v.string(), // "admin", "manager", "pharmacist", "cashier", "owner"
    status: v.string(), // "pending", "active", "deactivated", "locked"
    pharmacyId: v.optional(v.id("pharmacies")),
    branchId: v.optional(v.id("branches")),
    // v4.0 Manager-Specific fields
    accessScope: v.optional(v.string()), // "full_pharmacy", "branch_specific"
    assignedBranches: v.optional(v.array(v.id("branches"))),
    createdBy: v.optional(v.id("users")), // Creator identity
    // v4.0 Account Actions fields
    adminFlagged: v.optional(v.boolean()),
    adminFlagReason: v.optional(v.string()),
    adminLocked: v.optional(v.boolean()),
    adminLockReason: v.optional(v.string()),
    lockPlacedAt: v.optional(v.number()),
    lockLiftedAt: v.optional(v.number()),
    lockLiftedBy: v.optional(v.id("users")),
    ownerNotifiedOfAction: v.optional(v.boolean()),
    // v4.0 MFA & Security fields
    mfaEnabled: v.optional(v.boolean()),
    activeSessionsCount: v.optional(v.number()),
    passwordLastChanged: v.optional(v.number()),
    // v4.0 Activity fields
    lastActionPerformed: v.optional(v.string()),
    totalActionsLast30Days: v.optional(v.number()),

    // Migration fields
    migratedFromClerk: v.optional(v.boolean()),
    clerkId: v.optional(v.string()), // Keep for reference during migration
    mustResetPassword: v.optional(v.boolean()),
    migrationCompletedAt: v.optional(v.number()),

    // Email/Password Authentication
    passwordHash: v.optional(v.string()), // Bcrypt hashed password
  })
    .index("by_email", ["email"])
    .index("by_tokenIdentifier", ["tokenIdentifier"])
    .index("by_status", ["status"])
    .index("by_role", ["role"])
    .index("by_pharmacy", ["pharmacyId"])
    .index("by_branch", ["branchId"])
    .index("by_clerk_id", ["clerkId"]),

  pharmacies: defineTable({
    name: v.string(),
    pharmacyEmail: v.optional(v.string()),
    licenseCode: v.string(),
    staffCount: v.number(),
    subscriptionTier: v.string(), // "basic", "premium", "enterprise"
    status: v.string(), // "active", "deactivated", "pending"
    ownerId: v.id("users"),
    inviteCode: v.optional(v.string()),
    refundPolicy: v.optional(
      v.object({
        allow_refunds: v.boolean(),
        refund_window_days: v.number(),
        allow_discounts: v.boolean(),
        max_discount_percent: v.number(),
        require_manager_approval: v.boolean(),
      }),
    ),
    // v4.0 Owner Details fields
    legalName: v.optional(v.string()),
    tradingName: v.optional(v.string()),
    pharmacyType: v.optional(v.string()), // "retail", "hospital", "chain", "online"
    yearEstablished: v.optional(v.number()),
    // v4.0 Regulatory fields
    issuingAuthority: v.optional(v.string()),
    licenseExpiryDate: v.optional(v.number()),
    businessRegistrationNumber: v.optional(v.string()),
    taxId: v.optional(v.string()),
    // v4.0 Contact & Location fields
    primaryContactPhone: v.optional(v.string()),
    address: v.optional(
      v.object({
        street: v.string(),
        city: v.string(),
        state: v.string(),
        postalCode: v.string(),
        country: v.string(),
      }),
    ),
    // v4.0 Documents fields
    licenseCertificateUrl: v.optional(v.string()),
    businessRegistrationUrl: v.optional(v.string()),
    documentsUploadDate: v.optional(v.number()),
    // v4.0 Operational fields
    estimatedMonthlyPrescriptions: v.optional(v.number()),
    servicesOffered: v.optional(v.array(v.string())),
    // v4.0 Billing fields
    billingContactEmail: v.optional(v.string()),
    preferredCurrency: v.optional(v.string()),
    paymentMethodId: v.optional(v.id("payment_methods")),
    billingAddress: v.optional(
      v.object({
        street: v.string(),
        city: v.string(),
        state: v.string(),
        postalCode: v.string(),
        country: v.string(),
      }),
    ),
    // v4.0 Admin Actions fields
    adminFlagged: v.optional(v.boolean()),
    adminFlagReason: v.optional(v.string()),
    adminLocked: v.optional(v.boolean()),
    adminLockReason: v.optional(v.string()),
    ownerNotifiedOfAction: v.optional(v.boolean()),
    ownerActionNotificationAt: v.optional(v.number()),
    // v4.0 Subscription fields
    monthlyCost: v.optional(v.number()),
    billingStartDate: v.optional(v.number()),
    nextBillingDate: v.optional(v.number()),
    paymentStatus: v.optional(v.string()),
  })
    .index("by_owner", ["ownerId"])
    .index("by_subscription_tier", ["subscriptionTier"])
    .index("by_pharmacy_email", ["pharmacyEmail"]),

  branches: defineTable({
    pharmacyId: v.id("pharmacies"),
    name: v.string(),
    address: v.optional(v.string()),
    status: v.string(), // "pending", "active", "rejected", "deactivated"
    managerId: v.id("users"),
    // v4.0 Branch details
    code: v.optional(v.string()),
    type: v.optional(v.string()), // "retail", "hospital_pharmacy", "warehouse"
    operatingHours: v.optional(
      v.object({
        mon: v.optional(v.string()),
        tue: v.optional(v.string()),
        wed: v.optional(v.string()),
        thu: v.optional(v.string()),
        fri: v.optional(v.string()),
        sat: v.optional(v.string()),
        sun: v.optional(v.string()),
      }),
    ),
    contactPhone: v.optional(v.string()),
    licenseDetails: v.optional(
      v.object({
        licenseNumber: v.string(),
        issuingAuthority: v.string(),
        expiryDate: v.number(),
      }),
    ),
    assignedManagers: v.optional(v.array(v.id("users"))),
    staffCount: v.optional(v.number()),
  })
    .index("by_pharmacy", ["pharmacyId"])
    .index("by_status", ["status"]),

  medicines: defineTable({
    branchId: v.id("branches"),
    name: v.string(),
    category: v.string(),
    stock: v.number(),
    price: v.number(),
    minStock: v.optional(v.number()),
    type: v.optional(v.string()),
    manufacturer: v.optional(v.string()),
    barcode: v.optional(v.string()),
    expiryDate: v.optional(v.number()), // timestamp
    status: v.optional(v.string()), // "active", "returned", "disposed"
    // v4.0 Clinical Information
    genericName: v.string(),
    brandNames: v.array(v.string()),
    usageInstructions: v.optional(v.string()),
    sideEffects: v.optional(v.array(v.string())),
    warnings: v.optional(v.array(v.string())),
    storageRequirements: v.optional(v.string()),
    // v4.0 Pricing
    costPrice: v.optional(v.number()), // Visible to managers/owners only
    priceChangeHistory: v.array(
      v.object({
        from: v.number(),
        to: v.number(),
        changedBy: v.id("users"),
        changedAt: v.number(),
        branchId: v.optional(v.id("branches")),
      }),
    ),
    // v4.0 Supplier
    supplierId: v.optional(v.id("suppliers")),
    supplierName: v.optional(v.string()),
    // v4.0 Expiry Management
    batches: v.array(
      v.object({
        batchNumber: v.string(),
        expiryDate: v.number(),
        quantity: v.number(),
        receivedDate: v.number(),
      }),
    ),
    // v4.0 Dispensing
    prescriptionRequired: v.boolean(),
    controlledSubstance: v.boolean(),
    dosageLimit: v.optional(v.number()),
  }).index("by_branch", ["branchId"]),

  sales: defineTable({
    branchId: v.id("branches"),
    cashierId: v.id("users"),
    totalAmount: v.number(),
    status: v.string(),
    customerName: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    paymentMethod: v.string(),
    prescriptionId: v.optional(v.string()),
    items: v.array(
      v.object({
        medicineId: v.id("medicines"),
        quantity: v.number(),
        price: v.number(),
      }),
    ),
    chapaTransactionId: v.optional(v.string()),
    chapaPaymentMethod: v.optional(v.string()),
    chapaStatus: v.optional(v.string()),
    chapaReference: v.optional(v.string()),
  }).index("by_branch", ["branchId"]),

  audit_logs: defineTable({
    userId: v.id("users"),
    action: v.string(), // e.g., "approve_branch", "delete_pharmacy"
    entityId: v.string(),
    entityType: v.string(), // e.g., "branch", "pharmacy"
    details: v.optional(v.string()),
    timestamp: v.number(),
  }).index("by_user", ["userId"]),

  notifications: defineTable({
    userId: v.id("users"),
    pharmacyId: v.optional(v.id("pharmacies")),
    title: v.string(),
    message: v.string(),
    type: v.string(), // "info", "warning", "success", "error"
    priority: v.string(), // "low", "medium", "high"
    read: v.boolean(),
    readAt: v.optional(v.number()),
    link: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_created", ["createdAt"]),

  stock_requests: defineTable({
    branchId: v.id("branches"),
    pharmacistId: v.id("users"),
    medicineId: v.id("medicines"),
    quantity: v.number(),
    urgency: v.string(), // "low", "normal", "high"
    status: v.string(), // "pending", "approved", "rejected", "fulfilled"
    notes: v.optional(v.string()),
  }).index("by_branch", ["branchId"]),

  subscription_plans: defineTable({
    name: v.string(), // "Basic", "Premium", "Enterprise"
    code: v.string(), // "basic", "premium", "enterprise"
    price: v.number(), // Monthly price in birr
    currency: v.string(), // "ETB"
    features: v.array(v.string()), // List of features
    maxBranches: v.number(), // Maximum number of branches allowed
    maxUsers: v.number(), // Maximum number of users allowed
    isActive: v.boolean(), // Whether the plan is available
    description: v.optional(v.string()), // Plan description
  }).index("by_code", ["code"]),

  subscription_history: defineTable({
    pharmacyId: v.id("pharmacies"),
    oldTier: v.optional(v.string()), // Previous subscription tier
    newTier: v.string(), // New subscription tier
    changeType: v.string(), // "upgrade", "downgrade", "initial", "renewal", "cancellation"
    price: v.number(), // Price at time of change
    currency: v.string(), // "ETB"
    changedBy: v.id("users"), // Admin or system user who made the change
    reason: v.optional(v.string()), // Reason for change
    effectiveDate: v.number(), // When the change takes effect (timestamp)
    createdAt: v.number(), // When the history record was created (timestamp)
  })
    .index("by_pharmacy", ["pharmacyId"])
    .index("by_date", ["createdAt"]),

  // v4.0: Admin Actions & Account Management
  admin_actions: defineTable({
    targetUserId: v.id("users"),
    targetPharmacyId: v.optional(v.id("pharmacies")),
    actionType: v.string(), // "flag_for_review", "temporary_lock"
    reason: v.string(), // MANDATORY
    performedBy: v.id("users"), // Admin
    timestamp: v.number(),
    ownerNotifiedAt: v.optional(v.number()),
    ownerNotified: v.boolean(),
    actionStatus: v.string(), // "active", "lifted_by_admin", "lifted_by_owner"
  }).index("by_target_user", ["targetUserId"]),

  manager_flags: defineTable({
    managerId: v.id("users"),
    flagReason: v.string(),
    flaggedBy: v.id("users"), // Admin
    flaggedAt: v.number(),
    status: v.string(), // "flagged", "reviewed", "dismissed"
    ownerResponse: v.optional(v.string()),
    ownerRespondedAt: v.optional(v.number()),
  }).index("by_manager", ["managerId"]),

  // v4.0: Messaging System
  admin_broadcasts: defineTable({
    senderId: v.id("users"), // Admin
    targetType: v.string(), // "all_users", "all_owners", "specific_plan", "specific_country", "specific_pharmacy"
    targetIds: v.optional(v.array(v.string())), // Pharmacy IDs or plan codes
    messageType: v.string(), // "announcement", "newsletter", "compliance_alert", "subscription_reminder", "security_notice"
    title: v.string(),
    message: v.string(),
    deliveryStatus: v.array(
      v.object({
        pharmacyId: v.id("pharmacies"),
        delivered: v.boolean(),
        deliveredAt: v.optional(v.number()),
        read: v.boolean(),
        readAt: v.optional(v.number()),
      }),
    ),
    createdAt: v.number(),
  }).index("by_sender", ["senderId"]),

  owner_messages: defineTable({
    senderId: v.id("users"), // Owner
    pharmacyId: v.id("pharmacies"),
    targetType: v.string(), // "specific_branch", "multiple_branches", "specific_role", "specific_individual", "all_managers"
    targetBranches: v.optional(v.array(v.id("branches"))),
    targetRole: v.optional(v.string()), // "manager", "pharmacist", "cashier", "inventory_clerk", "delivery_staff"
    targetUserId: v.optional(v.id("users")), // For specific individual
    title: v.string(),
    message: v.string(),
    includeEmailNotification: v.boolean(),
    deliveryStatus: v.array(
      v.object({
        userId: v.id("users"),
        delivered: v.boolean(),
        read: v.boolean(),
        readAt: v.optional(v.number()),
      }),
    ),
    createdAt: v.number(),
  }).index("by_pharmacy", ["pharmacyId"]),

  // v4.0: Diagnostic Sessions
  diagnostic_sessions: defineTable({
    adminId: v.id("users"),
    targetUserId: v.id("users"),
    targetPharmacyId: v.optional(v.id("pharmacies")),
    sessionStartTime: v.number(),
    sessionEndTime: v.optional(v.number()),
    duration: v.optional(v.number()), // In seconds
    pagesViewed: v.array(
      v.object({
        page: v.string(),
        timestamp: v.number(),
      }),
    ),
    actionsAttempted: v.array(
      v.object({
        action: v.string(),
        blockedAt: v.number(),
        attemptedValue: v.optional(v.string()),
      }),
    ),
    sessionTriggerNote: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_admin", ["adminId"])
    .index("by_target", ["targetUserId"]),

  // v4.0: AI Assistant & Escalations
  ai_conversations: defineTable({
    userId: v.id("users"),
    pharmacyId: v.optional(v.id("pharmacies")),
    sessionId: v.string(),
    messages: v.array(
      v.object({
        role: v.string(), // "user", "assistant"
        content: v.string(),
        timestamp: v.number(),
        context: v.optional(v.any()), // Page/role context
      }),
    ),
    escalationStatus: v.optional(v.string()), // "phone", "email", "complaint", "resolved"
    escalationDetails: v.optional(
      v.object({
        type: v.string(),
        routedTo: v.string(), // "admin", "owner", "both"
        referenceNumber: v.string(),
        submittedAt: v.number(),
      }),
    ),
    isResolved: v.boolean(),
    resolvedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_session", ["sessionId"]),

  ai_escalations: defineTable({
    referenceNumber: v.string(),
    submitterId: v.id("users"),
    submitterRole: v.string(),
    category: v.string(), // "platform_issue", "pharmacy_owner", "manager_staff", "branch_operation"
    description: v.string(),
    routedTo: v.string(), // "admin", "owner", "both"
    status: v.string(), // "open", "in_progress", "resolved", "escalated"
    assignedTo: v.optional(v.id("users")),
    resolutionDetails: v.optional(v.string()),
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
  })
    .index("by_reference", ["referenceNumber"])
    .index("by_submitter", ["submitterId"]),

  // v4.0: Enhanced Audit Logs
  audit_log_categories: defineTable({
    code: v.string(), // "authentication", "owner_manager_actions", etc.
    name: v.string(),
    retentionMonths: v.number(),
    description: v.string(),
  }).index("by_code", ["code"]),

  audit_log_exports: defineTable({
    requestedBy: v.id("users"),
    dateRange: v.object({
      start: v.number(),
      end: v.number(),
    }),
    filters: v.optional(
      v.object({
        userId: v.optional(v.id("users")),
        actionType: v.optional(v.string()),
        entityType: v.optional(v.string()),
        category: v.optional(v.string()),
      }),
    ),
    format: v.string(), // "csv", "json", "pdf"
    recordCount: v.number(),
    fileUrl: v.string(),
    expiresAt: v.number(), // File cleanup after 7 days
    createdAt: v.number(),
  }).index("by_requester", ["requestedBy"]),

  // v4.0: Payment Methods
  payment_methods: defineTable({
    userId: v.id("users"),
    type: v.string(), // "card", "bank"
    provider: v.string(),
    last4: v.string(),
    isDefault: v.boolean(),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Site-wide settings
  site_settings: defineTable({
    contactEmail: v.string(),
    contactPhone: v.optional(v.string()),
    contactAddress: v.optional(v.string()),
    emailProvider: v.optional(v.string()),
    resendApiKey: v.optional(v.string()),
    testMode: v.boolean(),
    updatedAt: v.number(),
    updatedBy: v.optional(v.id("users")),
  }),

  // Contact messages
  contact_messages: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    message: v.string(),
    status: v.string(), // "unread", "read", "replied"
    adminReply: v.optional(v.string()),
    repliedAt: v.optional(v.number()),
    repliedBy: v.optional(v.id("users")),
    emailSent: v.boolean(),
    createdAt: v.number(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_email", ["email"])
    .index("by_created", ["createdAt"]),

  // Soft-deleted messages (trash)
  contact_messages_trash: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    message: v.string(),
    status: v.string(),
    adminReply: v.optional(v.string()),
    repliedAt: v.optional(v.number()),
    repliedBy: v.optional(v.id("users")),
    emailSent: v.boolean(),
    createdAt: v.number(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    deletedAt: v.number(),
    deletedBy: v.id("users"),
    originalId: v.id("contact_messages"),
  }).index("by_deleted", ["deletedAt"]),

  // Rate limiting
  rate_limits: defineTable({
    email: v.string(),
    ipAddress: v.string(),
    lastAttempt: v.number(),
    attemptCount: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_ip", ["ipAddress"]),

  // Landing Page: Testimonials with approval workflow
  testimonials: defineTable({
    ownerId: v.id("users"),
    pharmacyId: v.id("pharmacies"),
    ownerName: v.string(),
    pharmacyName: v.string(),
    profilePhotoUrl: v.optional(v.string()),
    content: v.string(), // Testimonial text
    starRating: v.number(), // 1-5 stars
    status: v.string(), // "pending", "approved", "rejected"
    adminNotes: v.optional(v.string()), // Reason for rejection or notes
    submittedAt: v.number(),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.id("users")), // Admin who reviewed
    displayOrder: v.optional(v.number()), // For manual ordering on landing page
  })
    .index("by_status", ["status"])
    .index("by_owner", ["ownerId"])
    .index("by_pharmacy", ["pharmacyId"])
    .index("by_display_order", ["displayOrder"]),

  // Landing Page: Editable content sections
  landing_page_content: defineTable({
    sectionKey: v.string(), // "hero", "services", "cta", "about", "features", etc.
    version: v.number(), // For versioning support
    isActive: v.boolean(),
    content: v.object({
      // Hero section
      heroTitle: v.optional(v.string()),
      heroSubtitle: v.optional(v.string()),
      heroDescription: v.optional(v.string()),
      heroCtaText: v.optional(v.string()),
      heroCtaSecondaryText: v.optional(v.string()),
      heroBackgroundImage: v.optional(v.string()),

      // Services section
      servicesTitle: v.optional(v.string()),
      servicesSubtitle: v.optional(v.string()),
      services: v.optional(
        v.array(
          v.object({
            id: v.string(),
            icon: v.string(), // Lucide icon name
            title: v.string(),
            description: v.string(),
            features: v.optional(v.array(v.string())),
          }),
        ),
      ),

      // CTA section
      ctaTitle: v.optional(v.string()),
      ctaDescription: v.optional(v.string()),
      ctaPrimaryButton: v.optional(v.string()),
      ctaSecondaryButton: v.optional(v.string()),

      // About section
      aboutMission: v.optional(v.string()),
      aboutVision: v.optional(v.string()),
      aboutValues: v.optional(v.array(v.string())),
      aboutStory: v.optional(v.string()),
      aboutStats: v.optional(
        v.array(
          v.object({
            label: v.string(),
            value: v.string(),
            description: v.optional(v.string()),
          }),
        ),
      ),

      // Features section
      featuresTitle: v.optional(v.string()),
      featuresSubtitle: v.optional(v.string()),
      features: v.optional(
        v.array(
          v.object({
            id: v.string(),
            icon: v.string(),
            title: v.string(),
            description: v.string(),
          }),
        ),
      ),

      // Testimonials section
      testimonialsTitle: v.optional(v.string()),
      testimonialsSubtitle: v.optional(v.string()),
      testimonialsButtonText: v.optional(v.string()),
    }),
    updatedAt: v.number(),
    updatedBy: v.optional(v.id("users")),
  })
    .index("by_section_key", ["sectionKey"])
    .index("by_active", ["isActive"]),

  // Landing Page: Section visibility and ordering
  landing_page_sections: defineTable({
    sectionId: v.string(), // "hero", "services", "features", "testimonials", "cta", "contact", "footer"
    name: v.string(),
    displayName: v.string(),
    description: v.optional(v.string()),
    isEnabled: v.boolean(),
    displayOrder: v.number(),
    analyticsEnabled: v.boolean(),
    lastUpdated: v.number(),
    updatedBy: v.optional(v.id("users")),
  })
    .index("by_enabled", ["isEnabled"])
    .index("by_display_order", ["displayOrder"]),

  // Landing Page: Analytics tracking
  landing_page_analytics: defineTable({
    sessionId: v.string(),
    sectionId: v.optional(v.string()),
    eventType: v.string(), // "view", "click", "scroll", "interaction"
    eventData: v.optional(
      v.object({
        elementId: v.optional(v.string()),
        elementType: v.optional(v.string()), // "button", "link", "card", etc.
        metadata: v.optional(v.any()),
      }),
    ),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    referrer: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_section", ["sectionId"])
    .index("by_event_type", ["eventType"])
    .index("by_timestamp", ["timestamp"]),

  // Landing Page: Analytics aggregated stats
  landing_page_analytics_daily: defineTable({
    date: v.string(), // YYYY-MM-DD format
    sectionId: v.string(),
    views: v.number(),
    uniqueVisitors: v.number(),
    clicks: v.number(),
    interactions: v.number(),
    avgEngagementTime: v.optional(v.number()), // in seconds
    updatedAt: v.number(),
  })
    .index("by_date", ["date"])
    .index("by_section_date", ["sectionId", "date"]),

  // Convex Auth Tables
  authAccounts: defineTable({
    userId: v.id("users"),
    type: v.string(), // "oauth", "email", "credentials"
    provider: v.string(), // "google", "github", "email"
    providerAccountId: v.string(),
    refresh_token: v.optional(v.string()),
    access_token: v.optional(v.string()),
    expires_at: v.optional(v.number()),
    token_type: v.optional(v.string()),
    scope: v.optional(v.string()),
    id_token: v.optional(v.string()),
    session_state: v.optional(v.string()),
  })
    .index("by_user_id", ["userId"])
    .index("by_provider_account", ["provider", "providerAccountId"]),

  authSessions: defineTable({
    userId: v.id("users"),
    sessionToken: v.string(),
    expires: v.number(),
  })
    .index("by_session_token", ["sessionToken"])
    .index("by_user_id", ["userId"]),

  authVerificationTokens: defineTable({
    identifier: v.string(),
    token: v.string(),
    expires: v.number(),
  }).index("by_identifier_token", ["identifier", "token"]),

  // Migration tracking
  migration_status: defineTable({
    userId: v.id("users"),
    migratedFrom: v.string(), // "clerk"
    migratedAt: v.number(),
    passwordResetSent: v.boolean(),
    emailVerified: v.boolean(),
  }).index("by_user_id", ["userId"]),
});
