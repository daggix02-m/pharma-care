import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Megaphone } from "lucide-react";
import {
  type TargetAudience,
  type MessageType,
  MESSAGE_TYPES,
} from "./broadcastTypes";

interface BroadcastStepComposeProps {
  title: string;
  onTitleChange: (title: string) => void;
  message: string;
  onMessageChange: (message: string) => void;
  messageType: MessageType;
  targetAudience: TargetAudience;
  selectedPlanCodes: string[];
  selectedPharmacyIds: string[];
  isAnimating: boolean;
}

export function BroadcastStepCompose({
  title,
  onTitleChange,
  message,
  onMessageChange,
  messageType,
  targetAudience,
  selectedPlanCodes,
  selectedPharmacyIds,
  isAnimating,
}: BroadcastStepComposeProps) {
  const selectedTargetLabel =
    MESSAGE_TYPES.find((t) => t.value === messageType)?.label || "Announcement";

  const targetLabel =
    targetAudience === "all_users"
      ? "All Users"
      : targetAudience === "all_owners"
        ? "All Pharmacy Owners"
        : targetAudience === "specific_plan"
          ? `${selectedPlanCodes.length} plan(s)`
          : `${selectedPharmacyIds.length} pharmacies(s)`;

  return (
    <div
      className={cn(
        "space-y-6",
        "transition-all duration-700 delay-400 ease-out",
        isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      )}
      style={{ transitionDelay: isAnimating ? "400ms" : "0ms" }}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-emerald-600" />
          <h3 className="font-display text-xl font-semibold text-slate-800">
            Compose your message
          </h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="broadcast-title">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="broadcast-title"
            placeholder="Enter message title..."
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="broadcast-message">
            Message <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="broadcast-message"
            placeholder="Enter your message content..."
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            rows={6}
            className="resize-none"
          />
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-slate-100/80">
          <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">
            Preview
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedTargetLabel}</Badge>
              <span className="text-xs text-slate-500">to: {targetLabel}</span>
            </div>
            {(targetAudience === "specific_plan" ||
              targetAudience === "specific_pharmacy") && (
              <p className="text-xs text-slate-500">
                {targetAudience === "specific_plan"
                  ? `${selectedPlanCodes.length} plan(s) selected`
                  : `${selectedPharmacyIds.length} pharmacy(s) selected`}
              </p>
            )}
            <h4 className="font-semibold text-slate-900">
              {title || "<Untitled>"}
            </h4>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
              {message || "<Your message here>"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
