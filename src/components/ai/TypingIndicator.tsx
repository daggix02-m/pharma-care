import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4">
      <Avatar className="h-8 w-8 border-2 border-emerald-500 bg-gradient-to-br from-emerald-500 to-teal-600">
        <AvatarFallback className="text-white">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex items-center gap-1">
          <div
            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}
