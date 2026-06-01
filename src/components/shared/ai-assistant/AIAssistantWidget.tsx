import * as React from "react";
import { AIChatInterface } from "@/components/ai/AIChatInterface";
import { AIFloatingButton } from "@/components/ai/AIFloatingButton";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@/contexts/AuthContext";

export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user } = useAuth();

  // Get unread message count from Convex
  const conversation = useQuery(
    api.ai.queries.getConversation,
    user?._id ? { userId: user._id } : undefined,
  );

  const unreadCount = conversation?.unreadCount || 0;

  return (
    <>
      <AIFloatingButton
        onClick={() => setIsOpen(true)}
        unreadCount={unreadCount}
      />
      <AIChatInterface
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        variant="sheet"
      />
    </>
  );
}
