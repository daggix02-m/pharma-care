import { Mail, CheckCircle2, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { TargetType } from "./TargetSelectionStep";
import { TARGET_OPTIONS } from "./TargetSelectionStep";
import { cn } from "@/lib/utils";

interface ComposeStepProps {
  title: string;
  message: string;
  isUrgent: boolean;
  includeEmailNotification: boolean;
  targetType: TargetType;
  onTitleChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onUrgentToggle: () => void;
  onEmailNotificationToggle: () => void;
  isAnimating: boolean;
}

export function ComposeStep({
  title,
  message,
  isUrgent,
  includeEmailNotification,
  targetType,
  onTitleChange,
  onMessageChange,
  onUrgentToggle,
  onEmailNotificationToggle,
  isAnimating,
}: ComposeStepProps) {
  return (
    <div
      className={cn(
        "space-y-6",
        "transition-all duration-700 delay-300 ease-out",
        isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      )}
      style={{ transitionDelay: isAnimating ? "300ms" : "0ms" }}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-emerald-600" />
          <h3 className="font-display text-xl font-semibold text-slate-800">
            Compose your message
          </h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message-title">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="message-title"
            placeholder="Enter message title..."
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message-content">
            Message <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="message-content"
            placeholder="Enter your message content..."
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            rows={6}
            className="resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Priority</Label>
            <Button
              type="button"
              variant={isUrgent ? "destructive" : "outline"}
              onClick={onUrgentToggle}
              className="w-full justify-start"
            >
              {isUrgent ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Urgent
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Normal
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Delivery Method</Label>
          <Button
            type="button"
            variant={includeEmailNotification ? "default" : "outline"}
            onClick={onEmailNotificationToggle}
            className="w-full justify-start"
          >
            <AtSign className="h-4 w-4 mr-2" />
            {includeEmailNotification ? "Email + In-App" : "In-App Only"}
          </Button>
          <p className="text-xs text-slate-500">
            {includeEmailNotification
              ? "Staff will receive this message in-app and via email"
              : "Staff will receive this message in-app only"}
          </p>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-slate-100/80">
        <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
          Preview
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-emerald-600" />
            <span className="text-xs text-slate-500">
              to: {TARGET_OPTIONS.find((t) => t.value === targetType)?.label}
            </span>
            {isUrgent && (
              <Badge variant="destructive" className="text-xs">
                URGENT
              </Badge>
            )}
          </div>
          <h4 className="font-semibold text-slate-900">
            {title || "<Untitled>"}
          </h4>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">
            {message || "<Your message here>"}
          </p>
          {includeEmailNotification && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <AtSign className="h-3 w-3" />
              <span>+ Email notification will be sent</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
