import * as React from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  aiService,
  AIContext,
  UserRole,
  EscalationOption,
} from "@/services/ai.service";
import gsap from "gsap";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ChatHeader } from "./ChatHeader";
import { TypingIndicator } from "./TypingIndicator";
import { EscalationPanel } from "./EscalationPanel";

interface Message {
  _id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  suggestions?: string[];
  escalations?: EscalationOption[];
}

interface AIChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: "dialog" | "sheet";
}

export function AIChatInterface({
  isOpen,
  onClose,
  variant = "sheet",
}: AIChatInterfaceProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputValue, setInputValue] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const [showEscalation, setShowEscalation] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  const userRole = (user?.role as UserRole) || "cashier";
  const currentPage = location.pathname;

  const conversationHistory = useQuery(
    api.ai.queries.getConversation,
    user?._id ? { userId: user._id } : undefined,
  );

  const sendMessageMutation = useMutation(api.ai.mutations.sendMessage);
  const escalateMutation = useMutation(api.ai.mutations.escalateConversation);

  React.useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = getWelcomeMessage(userRole);
      const suggestions = aiService.getSuggestions(userRole, currentPage);

      setMessages([
        {
          role: "assistant",
          content: welcomeMessage,
          timestamp: Date.now(),
          suggestions: suggestions,
        },
      ]);
    }
  }, [isOpen, userRole, currentPage]);

  React.useEffect(() => {
    if (conversationHistory?.messages && messages.length <= 1) {
      const historyMessages: Message[] = conversationHistory.messages.map(
        (msg: {
          role: "user" | "assistant";
          content: string;
          timestamp: number;
        }) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
        }),
      );
      setMessages((prev) => [...prev, ...historyMessages]);
    }
  }, [conversationHistory]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (isOpen && chatContainerRef.current) {
      gsap.fromTo(
        chatContainerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
      );
    }
  }, [isOpen]);

  const getWelcomeMessage = (role: UserRole): string => {
    const messages: Record<UserRole, string> = {
      admin:
        "Hello! I'm your PharmaCare AI Assistant. I can help you with pharmacy approvals, account management, diagnostic views, and platform governance. How can I assist you today?",
      owner:
        "Hello! I'm your PharmaCare AI Assistant. I can help you manage branches, staff, subscriptions, and send internal messages. What would you like to do?",
      manager:
        "Hello! I'm your PharmaCare AI Assistant. I can help you with staff management, inventory, reports, and branch operations. How can I help?",
      pharmacist:
        "Hello! I'm your PharmaCare AI Assistant. I can guide you through prescription dispensing, clinical alerts, and medicine information. What do you need help with?",
      cashier:
        "Hello! I'm your PharmaCare AI Assistant. I can help with payments, returns, discounts, and POS operations. How can I assist?",
    };
    return messages[role];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user) return;

    const userMessage: Message = {
      role: "user",
      content: inputValue.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const context: AIContext = {
        role: userRole,
        currentPage,
        userId: user._id,
        pharmacyId: user.pharmacyId,
        branchId: user.branchId,
      };

      const response = await aiService.getResponse(
        userMessage.content,
        context,
      );

      await sendMessageMutation({
        userId: user._id,
        role: userMessage.content,
        assistantResponse: response.message,
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: response.message,
        timestamp: Date.now(),
        suggestions: response.suggestions,
        escalations: response.escalations,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const handleEscalation = async (escalation: EscalationOption) => {
    if (!user) return;

    try {
      await escalateMutation({
        userId: user._id,
        pharmacyId: user.pharmacyId,
        role: userRole,
        type: escalation.type,
        reason: "User requested escalation",
        category: "platform",
      });

      const escalationMessage: Message = {
        role: "assistant",
        content: `I've initiated an escalation to ${escalation.label}. ${
          escalation.type === "phone"
            ? `You can call us at ${escalation.contact}`
            : escalation.type === "email"
              ? `We've sent details to ${escalation.contact}`
              : "Your complaint has been logged with reference number #" +
                Math.random().toString(36).substr(2, 9).toUpperCase()
        }. Is there anything else I can help you with?`,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, escalationMessage]);
      setShowEscalation(false);
    } catch (error) {
      console.error("Escalation Error:", error);
    }
  };

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const chatContent = (
    <div ref={chatContainerRef} className="flex flex-col h-full">
      <ChatHeader
        userRole={userRole}
        showEscalation={showEscalation}
        onToggleEscalation={() => setShowEscalation(!showEscalation)}
        onClose={onClose}
      />

      {showEscalation && (
        <EscalationPanel
          onEscalation={handleEscalation}
          onClose={() => setShowEscalation(false)}
        />
      )}

      <div className="flex-1 px-4 py-4 overflow-y-auto">
        <div className="space-y-2">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message}
              isLastMessage={index === messages.length - 1}
              onSuggestionClick={handleSuggestionClick}
              onEscalation={handleEscalation}
              formatTime={formatTime}
            />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSendMessage}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
          }
        }}
        disabled={isTyping}
        inputRef={inputRef}
      />
    </div>
  );

  if (variant === "dialog") {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden h-[600px]">
          {chatContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[480px] p-0 overflow-hidden"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>AI Assistant</SheetTitle>
        </SheetHeader>
        {chatContent}
      </SheetContent>
    </Sheet>
  );
}
