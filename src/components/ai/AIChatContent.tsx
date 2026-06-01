import type { EscalationOption } from "@/services/ai.service";
import { ScrollArea } from "@/components/ui/scroll-area";
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

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: "dialog" | "sheet";
  messages: Message[];
  inputValue: string;
  setInputValue: (value: string) => void;
  isTyping: boolean;
  showEscalation: boolean;
  setShowEscalation: (value: boolean) => void;
  handleSendMessage: () => void;
  handleSuggestionClick: (suggestion: string) => void;
  handleEscalation: (escalation: EscalationOption) => void;
  formatTime: (timestamp: number) => string;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  chatContainerRef: React.RefObject<HTMLDivElement | null>;
  userRole: string;
}

export function AIChatContent({
  onClose,
  messages,
  inputValue,
  setInputValue,
  isTyping,
  showEscalation,
  setShowEscalation,
  handleSendMessage,
  handleSuggestionClick,
  handleEscalation,
  formatTime,
  messagesEndRef,
  inputRef,
  chatContainerRef,
  userRole,
}: AIChatProps) {
  return (
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

      <ScrollArea className="flex-1 px-4 py-4">
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
      </ScrollArea>

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
}
