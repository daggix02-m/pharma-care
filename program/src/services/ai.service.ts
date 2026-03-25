/**
 * AI Service - Provides role-scoped AI assistance
 *
 * Architecture:
 * - Interface-based design allows easy swapping between mock and real implementations
 * - MockAIService: Current implementation with scripted responses
 * - OpenAIService: Future implementation for real API integration
 *
 * Usage:
 * const aiService = AIServiceFactory.create(); // Returns MockAIService currently
 * const response = await aiService.getResponse(message, context);
 */

export type UserRole = 'admin' | 'owner' | 'manager' | 'pharmacist' | 'cashier';

export interface AIContext {
  role: UserRole;
  currentPage: string;
  userId: string;
  pharmacyId?: string;
  branchId?: string;
}

export interface AIResponse {
  message: string;
  suggestions?: string[];
  escalations?: EscalationOption[];
  context?: Record<string, unknown>;
}

export interface EscalationOption {
  type: 'phone' | 'email' | 'complaint';
  label: string;
  description: string;
  contact?: string;
}

export interface EscalationData {
  type: 'phone' | 'email' | 'complaint';
  reason: string;
  userId: string;
  pharmacyId?: string;
  role: UserRole;
  category?: 'platform' | 'owner' | 'manager' | 'staff' | 'branch';
}

export interface AIService {
  getResponse(message: string, context: AIContext): Promise<AIResponse>;
  escalate(data: EscalationData): Promise<void>;
  getSuggestions(role: UserRole, currentPage: string): string[];
}

// ============================================================
// MOCK IMPLEMENTATION (Current)
// ============================================================

class MockAIService implements AIService {
  private readonly supportPhone = '+1-800-PHARMA-CARE';
  private readonly supportEmail = 'support@pharmacare.com';

  async getResponse(message: string, context: AIContext): Promise<AIResponse> {
    const lowerMessage = message.toLowerCase();

    // Check for escalation keywords
    if (this.isEscalationRequest(lowerMessage)) {
      return {
        message: this.getEscalationResponse(context.role),
        escalations: this.getEscalationOptions(context.role),
      };
    }

    // Check for out-of-scope questions
    if (this.isOutOfScope(lowerMessage, context.role)) {
      return {
        message: this.getOutOfScopeResponse(context.role),
        escalations: this.getEscalationOptions(context.role),
      };
    }

    // Return role-specific response
    const response = this.getRoleSpecificResponse(lowerMessage, context);

    return {
      message: response.message,
      suggestions: response.suggestions,
      escalations: response.escalations,
    };
  }

  async escalate(data: EscalationData): Promise<void> {
    // In mock mode, just log to console
    // In real implementation, this would call Convex mutation
    console.log('[AI Escalation]', data);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  getSuggestions(role: UserRole, currentPage: string): string[] {
    const suggestions: Record<UserRole, string[]> = {
      admin: [
        'How do I approve a pharmacy application?',
        'What should I check in a diagnostic view?',
        'How do I flag a suspicious manager account?',
        'Where can I see pending appeals?',
      ],
      owner: [
        'How do I create a new branch?',
        'How do I add a manager?',
        'How do I transfer ownership?',
        'How do I view my subscription details?',
      ],
      manager: [
        'How do I add staff to my branch?',
        'How do I check low stock alerts?',
        'How do I authorize a large discount?',
        'How do I generate sales reports?',
      ],
      pharmacist: [
        'How do I process a prescription?',
        'What do drug interaction warnings mean?',
        'How do I check medicine stock levels?',
        'How do I handle a controlled substance?',
      ],
      cashier: [
        'How do I process a return?',
        'How do I apply a discount code?',
        'What payment methods are accepted?',
        'How do I check the prescription queue?',
      ],
    };

    // Add context-aware suggestions based on current page
    const pageSpecific = this.getPageSpecificSuggestions(role, currentPage);

    return [...suggestions[role], ...pageSpecific].slice(0, 4);
  }

  private isEscalationRequest(message: string): boolean {
    const escalationKeywords = [
      'escalate',
      'complaint',
      'speak to human',
      'contact support',
      'phone',
      'call',
      'email support',
      'file complaint',
      'report issue',
      'talk to someone',
      'human agent',
      'support team',
    ];
    return escalationKeywords.some((keyword) => message.includes(keyword));
  }

  private isOutOfScope(message: string, role: UserRole): boolean {
    // Define scope boundaries per role
    const outOfScopePatterns: Record<UserRole, string[]> = {
      admin: ['billing settings', 'create branch', 'add manager'],
      owner: ['approve application', 'view other pharmacy', 'admin dashboard'],
      manager: ['create branch', 'billing', 'subscription'],
      pharmacist: ['billing', 'cost price', 'modify medicine'],
      cashier: ['cost price', 'stock levels', 'patient records', 'clinical'],
    };

    const patterns = outOfScopePatterns[role] || [];
    return patterns.some((pattern) => message.includes(pattern));
  }

  private getOutOfScopeResponse(role: UserRole): string {
    const responses: Record<UserRole, string> = {
      admin:
        'This topic falls outside your admin scope. As an admin, you focus on platform governance, pharmacy approvals, and account security. Is there something else I can help you with?',
      owner:
        'This action requires owner privileges, which you have. However, this specific topic may be outside the current system scope. Would you like me to escalate this to platform support?',
      manager:
        'This topic falls outside your manager scope. Managers handle staff, inventory, and branch operations within their assigned scope. For questions about billing or branch creation, please contact your pharmacy owner.',
      pharmacist:
        'This information is outside your pharmacist scope. Your role focuses on prescription dispensing, patient safety, and medicine information. For billing or stock management questions, please ask your manager.',
      cashier:
        'This is outside your cashier scope. Cashiers handle payment processing, receipts, and customer transactions. For clinical or inventory questions, please consult with a pharmacist or manager.',
    };
    return responses[role];
  }

  private getEscalationResponse(role: UserRole): string {
    return `I understand you'd like to speak with a support representative. Based on your role as a ${role}, I can connect you through the following channels. Please select the most appropriate option for your needs.`;
  }

  private getEscalationOptions(role: UserRole): EscalationOption[] {
    const options: EscalationOption[] = [
      {
        type: 'phone',
        label: 'Phone Support',
        description: 'Speak with a representative immediately',
        contact: this.supportPhone,
      },
      {
        type: 'email',
        label: 'Email Support',
        description: 'Send a detailed inquiry via email',
        contact: this.supportEmail,
      },
    ];

    // Add complaint option for non-admin roles
    if (role !== 'admin') {
      options.push({
        type: 'complaint',
        label: 'File a Complaint',
        description: 'Submit a formal complaint with tracking',
      });
    }

    return options;
  }

  private getPageSpecificSuggestions(_role: UserRole, page: string): string[] {
    const pageSuggestions: Record<string, string[]> = {
      '/admin': ['Review pending applications', 'Check flagged accounts'],
      '/admin/appeals': ['Review appeal details', 'Check appeal history'],
      '/owner': ['Manage branches', 'View subscription status'],
      '/manager': ['Check staff activity', 'Review inventory alerts'],
      '/pharmacist': ['Process prescription queue', 'Check expiry alerts'],
      '/cashier/overview': ['View payment queue', 'Check shift summary'],
    };

    return pageSuggestions[page] || [];
  }

  private getRoleSpecificResponse(message: string, context: AIContext): AIResponse {
    const role = context.role;
    const page = context.currentPage;

    // Context-aware responses
    if (page.includes('admin') && role === 'admin') {
      return this.getAdminResponse(message);
    } else if (page.includes('owner') && role === 'owner') {
      return this.getOwnerResponse(message);
    } else if (page.includes('manager') && role === 'manager') {
      return this.getManagerResponse(message);
    } else if (page.includes('pharmacist') && role === 'pharmacist') {
      return this.getPharmacistResponse(message);
    } else if (page.includes('cashier') && role === 'cashier') {
      return this.getCashierResponse(message);
    }

    // Default response
    return {
      message:
        "I'm here to help! Could you provide more details about what you'd like to do? I can assist with questions related to your role and current page.",
      suggestions: this.getSuggestions(role, page),
    };
  }

  private getAdminResponse(message: string): AIResponse {
    if (message.includes('approve')) {
      return {
        message:
          "To approve a pharmacy application:\n\n1. Go to the Pending Applications section\n2. Click on the application to review\n3. Verify all documents (license, registration)\n4. Check pharmacy details and owner identity\n5. Click 'Approve' and add an optional note\n\nThe pharmacy owner will be notified immediately.",
        suggestions: [
          'How do I reject an application?',
          'What documents should I verify?',
          'How do I flag suspicious activity?',
        ],
      };
    }

    if (message.includes('diagnostic')) {
      return {
        message:
          "The Diagnostic View lets you see the platform as a specific user sees it. To use it:\n\n1. Go to a user's account from the Pharmacy Detail Page\n2. Click 'Enter Diagnostic View'\n3. You'll see a read-only view of their interface\n4. All actions are logged for audit purposes\n5. The user won't know you're viewing their account\n\nThis is useful for troubleshooting reported issues.",
        suggestions: [
          'What can I do in diagnostic view?',
          'How do I exit diagnostic view?',
          'Is diagnostic view logged?',
        ],
      };
    }

    if (message.includes('flag')) {
      return {
        message:
          "To flag a manager or staff account:\n\n1. Go to the Pharmacy Detail Page\n2. Expand the Managers or Staff section\n3. Click 'Flag for Owner Review' on the account\n4. Enter a mandatory reason explaining the concern\n5. The owner is notified immediately\n\nThe account remains active but is marked for owner attention.",
        suggestions: [
          'When should I flag vs lock an account?',
          'What happens when I flag an account?',
          'Can the owner see my flag reason?',
        ],
      };
    }

    return {
      message:
        'As an admin, you can manage pharmacy applications, monitor accounts, view audit logs, and perform diagnostic sessions. What would you like help with?',
      suggestions: [
        'How do I view pending applications?',
        'How do I check audit logs?',
        'How do I suspend a pharmacy?',
      ],
    };
  }

  private getOwnerResponse(message: string): AIResponse {
    if (message.includes('branch')) {
      return {
        message:
          "To create a new branch:\n\n1. Click 'Add New Branch' from your dashboard\n2. Confirm the subscription cost adjustment\n3. Fill in branch details (name, code, address, hours)\n4. Review the payment summary\n5. Complete payment\n6. Submit for admin approval\n\nThe branch will be activated after admin review.",
        suggestions: [
          'How much does each branch cost?',
          'How do I assign managers to branches?',
          'What happens after I submit?',
        ],
      };
    }

    if (message.includes('manager')) {
      return {
        message:
          "To add a manager:\n\n1. Go to Staff Management\n2. Click 'Create Manager'\n3. Enter their email, name, and phone\n4. Select access scope:\n   - Full Pharmacy Access: Can manage all branches\n   - Branch-Specific: Select which branches they can access\n5. Send invitation\n\nThey'll receive an email to set up their account.",
        suggestions: [
          "What's the difference between manager scopes?",
          "How do I change a manager's access?",
          'Can I remove a manager?',
        ],
      };
    }

    return {
      message:
        'As the owner, you have full control over your pharmacy organization. You can create branches, add managers, manage subscriptions, and send internal messages. How can I assist you today?',
      suggestions: [
        'How do I view my subscription?',
        'How do I send a message to my staff?',
        'How do I transfer ownership?',
      ],
    };
  }

  private getManagerResponse(message: string): AIResponse {
    if (message.includes('staff')) {
      return {
        message:
          "To add staff to your branch:\n\n1. Go to Staff Management\n2. Click 'Add Staff Member'\n3. Select the branch (if managing multiple)\n4. Enter their details and role:\n   - Pharmacist, Cashier, Inventory Clerk, or Delivery Staff\n5. Send invitation\n\nThe staff member will receive setup instructions via email.",
        suggestions: [
          'How many staff can I add?',
          'Can I transfer staff between branches?',
          'How do I deactivate a staff member?',
        ],
      };
    }

    if (message.includes('stock') || message.includes('inventory')) {
      return {
        message:
          'To check inventory and stock levels:\n\n1. Go to the Inventory Dashboard\n2. View low stock alerts (items at or below reorder level)\n3. Check expiry warnings (items expiring within 30 days)\n4. Use the search bar to find specific medicines\n5. Click on any medicine to see batch details\n\nYou can also receive new stock, adjust quantities, and transfer between branches.',
        suggestions: [
          'How do I receive new stock?',
          'How do I transfer stock between branches?',
          'What do the stock badges mean?',
        ],
      };
    }

    return {
      message:
        'As a manager, you oversee staff, inventory, and branch operations within your assigned scope. What would you like help with today?',
      suggestions: [
        'How do I check staff activity?',
        'How do I generate reports?',
        'How do I authorize a discount?',
      ],
    };
  }

  private getPharmacistResponse(message: string): AIResponse {
    if (message.includes('prescription')) {
      return {
        message:
          "To process a prescription:\n\n1. Open the Prescription Queue\n2. Select the prescription to review\n3. Verify patient identity\n4. Review all medicines for:\n   - Drug interactions\n   - Allergy flags\n   - Dosage warnings\n5. Acknowledge any alerts with documented reason if overriding\n6. Select batches (FIFO auto-selected)\n7. For controlled substances: get second authorization\n8. Mark 'Ready for Payment'\n\nThe prescription moves to the Payment Queue for the cashier.",
        suggestions: [
          'What do the alert colors mean?',
          'How do I override a warning?',
          'What is controlled substance double-auth?',
        ],
      };
    }

    if (message.includes('interaction')) {
      return {
        message:
          "Drug interaction warnings appear when a prescribed medicine has a known interaction with something the patient has taken in the last 90 days.\n\n**Amber warnings** are advisory - you can proceed after acknowledging them. Always document your reason if overriding.\n\nIf you're unsure about an interaction, consult clinical references or escalate to a senior pharmacist.",
        suggestions: [
          'Can I see interaction details?',
          'Where is the allergy information?',
          'How do I document an override?',
        ],
      };
    }

    return {
      message:
        'As a pharmacist, you manage prescription dispensing, clinical safety checks, and patient interactions. Your workflow is designed for accuracy and safety. What can I help you with?',
      suggestions: [
        'How do I check medicine stock?',
        'How do I enter a manual prescription?',
        'How do I view patient history?',
      ],
    };
  }

  private getCashierResponse(message: string): AIResponse {
    if (message.includes('return')) {
      return {
        message:
          "To process a return:\n\n**OTC Returns:**\n• Within 48 hours & below threshold: Process directly\n• Above threshold or after 48 hours: Manager authorization required\n\n**Prescription Returns:**\n• Hard-blocked by system (not allowed)\n\n**Controlled Substances:**\n• Hard-blocked by system (not allowed)\n\n1. Go to Returns section\n2. Find the original transaction\n3. Select items to return\n4. Enter reason\n5. Process refund via original payment method\n6. Items go to 'Pending Review' (not auto-restocked)",
        suggestions: [
          "What's the return threshold?",
          'How do I get manager authorization?',
          'Can I do a partial return?',
        ],
      };
    }

    if (message.includes('discount') || message.includes('payment')) {
      return {
        message:
          "To apply a discount:\n\n1. In the POS, click 'Apply Discount'\n2. Select:\n   - Pre-configured discount code, OR\n   - Membership discount\n3. If above threshold: Manager PIN required\n4. System calculates new total\n5. Process payment\n\n**Payment Methods:**\n- Cash: Enter tendered amount, system calculates change\n- Card: Confirm terminal payment\n- Insurance: Select insurer, enter claim ref, patient pays co-payment\n- Credit Account: Post to customer account\n- Split Payment: Two methods simultaneously",
        suggestions: [
          'What discounts are available?',
          'How do I process insurance?',
          'Can I split payment?',
        ],
      };
    }

    if (message.includes('prescription') && message.includes('queue')) {
      return {
        message:
          "The Payment Queue shows prescriptions marked 'Ready for Payment' by pharmacists.\n\n1. Open the Payment Queue\n2. Select a prescription\n3. Items are pre-populated and locked\n4. Apply discounts if applicable\n5. Select payment method\n6. Process payment\n7. Issue receipt\n\n**Important:** You cannot modify prescription items or quantities - they're locked after pharmacist handoff.",
        suggestions: [
          'Can I modify prescription items?',
          'What if the patient changes their mind?',
          'How do I issue a receipt?',
        ],
      };
    }

    return {
      message:
        'As a cashier, you handle payment processing, receipts, discounts, and returns. Your interface is streamlined for quick transactions. What would you like help with?',
      suggestions: [
        'How do I start a new sale?',
        'How do I check my shift summary?',
        'What if a payment fails?',
      ],
    };
  }
}

// ============================================================
// FUTURE: REAL API IMPLEMENTATION
// ============================================================

/**
 * OpenAI/Claude API Implementation (Future)
 *
 * To activate:
 * 1. Set OPENAI_API_KEY in environment
 * 2. Create Convex action to proxy API calls
 * 3. Update AIServiceFactory to return OpenAIService
 */
class OpenAIService implements AIService {
  private readonly apiKey: string;
  private readonly apiEndpoint: string;

  constructor(apiKey: string, provider: 'openai' | 'anthropic' = 'openai') {
    this.apiKey = apiKey;
    this.apiEndpoint =
      provider === 'openai'
        ? 'https://api.openai.com/v1/chat/completions'
        : 'https://api.anthropic.com/v1/messages';
  }

  async getResponse(message: string, context: AIContext): Promise<AIResponse> {
    const systemPrompt = this.buildSystemPrompt(context);

    // This would be called from a Convex action in production
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    return {
      message: data.choices[0].message.content,
      suggestions: this.getSuggestions(context.role, context.currentPage),
    };
  }

  async escalate(data: EscalationData): Promise<void> {
    // Call Convex mutation to create escalation ticket
    console.log('[AI Escalation - Real API]', data);
  }

  getSuggestions(role: UserRole, currentPage: string): string[] {
    // Same as MockAIService
    const mock = new MockAIService();
    return mock.getSuggestions(role, currentPage);
  }

  private buildSystemPrompt(context: AIContext): string {
    return `You are PharmaCare AI Assistant, a helpful assistant for pharmacy management.

User Role: ${context.role}
Current Page: ${context.currentPage}

ROLE BOUNDARIES:
- Only answer questions relevant to the user's role
- If asked about something outside their scope, politely decline and offer escalation
- Never provide medical advice beyond what's in the medicine catalogue

RESPONSE FORMAT:
- Use clear, numbered steps for procedures
- Be concise but thorough
- Use professional but friendly tone
- Include relevant context from the current page when applicable

ESCALATION:
- If user asks to escalate, provide escalation options
- If question is out of scope, suggest escalation
- Never pretend to be a human or medical professional`;
  }
}

// ============================================================
// FACTORY
// ============================================================

export class AIServiceFactory {
  private static instance: AIService | null = null;

  static create(): AIService {
    if (!this.instance) {
      // Check if we should use real API
      const useRealAPI = import.meta.env.VITE_USE_AI_API === 'true';
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

      if (useRealAPI && apiKey) {
        this.instance = new OpenAIService(apiKey);
      } else {
        this.instance = new MockAIService();
      }
    }
    return this.instance;
  }

  static reset(): void {
    this.instance = null;
  }
}

// Export singleton instance
export const aiService = AIServiceFactory.create();

// Hook for React components
export function useAIService() {
  return aiService;
}
