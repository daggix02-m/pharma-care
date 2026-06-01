import { Bot, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  userRole: string;
  showEscalation: boolean;
  onToggleEscalation: () => void;
  onClose: () => void;
}

export function ChatHeader({
  userRole,
  showEscalation,
  onToggleEscalation,
  onClose,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 rounded-full border-2 border-background" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">AI Assistant</h3>
          <p className="text-xs text-muted-foreground">
            Role-scoped for {userRole}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleEscalation}
          className={cn("text-xs", showEscalation && "bg-muted")}
        >
          <AlertTriangle className="h-3.5 w-3.5 mr-1" />
          Escalate
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
