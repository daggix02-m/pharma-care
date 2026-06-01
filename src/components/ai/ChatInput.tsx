import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  disabled: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onKeyDown,
  disabled,
  inputRef,
}: ChatInputProps) {
  return (
    <div className="px-4 py-3 border-t border-border bg-background">
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type your message..."
          className="flex-1"
          disabled={disabled}
        />
        <Button
          onClick={onSend}
          disabled={!value.trim() || disabled}
          size="icon"
          className="shrink-0"
        >
          {disabled ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Press Enter to send &bull; AI responses are role-scoped
      </p>
    </div>
  );
}
