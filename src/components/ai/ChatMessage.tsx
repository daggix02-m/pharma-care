import * as React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EscalationOption } from "@/services/ai.service";

interface Message {
  _id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  suggestions?: string[];
  escalations?: EscalationOption[];
}

interface ChatMessageProps {
  message: Message;
  isLastMessage: boolean;
  onSuggestionClick: (suggestion: string) => void;
  onEscalation: (escalation: EscalationOption) => void;
  formatTime: (timestamp: number) => string;
}

export function ChatMessage({
  message,
  isLastMessage,
  onSuggestionClick,
  onEscalation,
  formatTime,
}: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex gap-3 mb-4",
        message.role === "user" ? "flex-row-reverse" : "flex-row",
      )}
    >
      <Avatar
        className={cn(
          "h-8 w-8 border-2",
          message.role === "user"
            ? "bg-primary border-primary"
            : "bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-500",
        )}
      >
        <AvatarFallback className="text-white">
          {message.role === "user" ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "flex flex-col max-w-[80%]",
          message.role === "user" ? "items-end" : "items-start",
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            message.role === "user"
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-muted text-foreground rounded-bl-sm",
          )}
        >
          {message.content.split("\n").map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < message.content.split("\n").length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>

        <span className="text-xs text-muted-foreground mt-1 px-1">
          {formatTime(message.timestamp)}
        </span>

        {isLastMessage &&
          message.role === "assistant" &&
          message.suggestions &&
          message.suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {message.suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => onSuggestionClick(suggestion)}
                  className="text-xs px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

        {isLastMessage &&
          message.role === "assistant" &&
          message.escalations &&
          message.escalations.length > 0 && (
            <MessageEscalations
              escalations={message.escalations}
              onEscalation={onEscalation}
            />
          )}
      </div>
    </div>
  );
}

interface MessageEscalationsProps {
  escalations: EscalationOption[];
  onEscalation: (escalation: EscalationOption) => void;
}

function MessageEscalations({
  escalations,
  onEscalation,
}: MessageEscalationsProps) {
  return (
    <div className="mt-3 space-y-2 w-full">
      <p className="text-xs text-muted-foreground font-medium">
        Escalation Options:
      </p>
      <div className="grid grid-cols-1 gap-2">
        {escalations.map((escalation, idx) => (
          <button
            key={idx}
            onClick={() => onEscalation(escalation)}
            className="flex items-center gap-3 p-3 bg-background border border-border rounded-lg hover:bg-muted/50 transition-colors text-left"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {escalation.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {escalation.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
