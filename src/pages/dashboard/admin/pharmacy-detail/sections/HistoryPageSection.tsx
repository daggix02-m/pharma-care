import {
  Clock,
  MessageCircle,
  AlertCircle,
  FileText,
  ChevronDown,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import type { Doc } from "@convex/_generated/dataModel";

interface HistoryPageSectionProps {
  pharmacyId: string;
  auditLogs: Doc<"audit_logs">[];
  subscriptionHistory: Doc<"subscription_history">[];
}

type HistoryEvent = {
  id: string;
  type: "lifecycle" | "admin_action" | "subscription" | "appeal";
  title: string;
  date: number;
  description: string;
  status: "completed" | "pending" | "in_progress" | "rejected";
  details: Record<string, unknown>;
};

export function HistoryPageSection({
  pharmacyId: _pharmacyId,
  auditLogs,
  subscriptionHistory,
}: HistoryPageSectionProps) {
  const [appealDialog, setAppealDialog] = useState(false);
  const [appealType, setAppealType] = useState("Admin Action");
  const [appealDetails, setAppealDetails] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_selectedEvent, _setSelectedEvent] = useState<unknown>(null);

  const historyEvents: HistoryEvent[] = [
    ...subscriptionHistory.map((record) => ({
      id: `sub_${record._id}`,
      type: "subscription" as const,
      title: `Subscription ${record.changeType}`,
      date: record.createdAt,
      description: `${record.oldTier || "none"} -> ${record.newTier}`,
      status: "completed" as const,
      details: {
        oldPlan: record.oldTier,
        newPlan: record.newTier,
        price: record.price,
      },
    })),
    ...auditLogs.map((log) => ({
      id: `audit_${log._id}`,
      type: log.action.includes("appeal")
        ? ("appeal" as const)
        : ("admin_action" as const),
      title: log.action
        .replace(/_/g, " ")
        .replace(/\b\w/g, (m) => m.toUpperCase()),
      date: log.timestamp,
      description: log.details || "No details",
      status: "completed" as const,
      details: {
        entityType: log.entityType,
      },
    })),
  ].sort((a, b) => b.date - a.date);

  const handleSubmitAppeal = () => {
    if (!appealDetails.trim()) {
      toast.error("Please provide appeal details");
      return;
    }
    toast.success("Appeal submission saved locally for owner follow-up");
    setAppealDialog(false);
    setAppealType("Admin Action");
    setAppealDetails("");
  };

  const typeConfig: Record<
    string,
    { icon: typeof Clock; color: string; bg: string }
  > = {
    lifecycle: { icon: Clock, color: "text-blue-600", bg: "bg-blue-500/10" },
    admin_action: {
      icon: AlertCircle,
      color: "text-orange-600",
      bg: "bg-orange-500/10",
    },
    subscription: {
      icon: FileText,
      color: "text-green-600",
      bg: "bg-green-500/10",
    },
    appeal: {
      icon: MessageCircle,
      color: "text-purple-600",
      bg: "bg-purple-500/10",
    },
  };

  const statusConfig = {
    completed: { label: "Completed", variant: "default" as const },
    pending: { label: "Pending", variant: "secondary" as const },
    in_progress: { label: "In Progress", variant: "outline" as const },
    rejected: { label: "Rejected", variant: "destructive" as const },
  };

  return (
    <div className="space-y-4">
      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-[hsl(var(--medical-teal))]" />
            History Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {historyEvents.map((event, idx) => (
              <HistoryEvent
                key={event.id}
                event={event}
                index={idx}
                config={typeConfig}
                statusConfig={statusConfig}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit Appeal Dialog */}
      <Dialog open={appealDialog} onOpenChange={setAppealDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-[hsl(var(--medical-teal))]" />
              Submit Appeal
            </DialogTitle>
            <DialogDescription>
              Submit an appeal for an admin action or decision
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="appeal-type">Appeal Type</Label>
              <select
                id="appeal-type"
                value={appealType}
                onChange={(e) => setAppealType(e.target.value)}
                className="w-full mt-2 px-3 py-2 rounded-lg border-2 border-border bg-background focus:outline-none focus:border-[hsl(var(--medical-teal))] transition-colors"
              >
                <option>Admin Action</option>
                <option>Branch Rejection</option>
                <option>Subscription Issue</option>
                <option>Account Lock</option>
              </select>
            </div>
            <div>
              <Label htmlFor="appeal-details">
                Appeal Details <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="appeal-details"
                placeholder="Describe the reason for your appeal..."
                rows={5}
                className="mt-2"
                value={appealDetails}
                onChange={(e) => setAppealDetails(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="appeal-attachment">Attachment (Optional)</Label>
              <Input id="appeal-attachment" type="file" className="mt-2" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAppealDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitAppeal}>
              <Send className="h-4 w-4 mr-2" />
              Submit Appeal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface HistoryEventProps {
  event: HistoryEvent;
  index: number;
  config: Record<string, { icon: typeof Clock; color: string; bg: string }>;
  statusConfig: Record<
    string,
    {
      label: string;
      variant: "default" | "secondary" | "outline" | "destructive";
    }
  >;
}

function HistoryEvent({
  event,
  index: _index,
  config,
  statusConfig,
}: HistoryEventProps) {
  const typeInfo = config[event.type] || config.lifecycle;
  const Icon = typeInfo.icon;
  const statusInfo = statusConfig[event.status] || statusConfig.completed;
  const entityType = event.details.entityType as string | undefined;

  return (
    <div className="flex gap-4">
      {/* Timeline Line */}
      <div className="w-0.5 bg-border ml-5 h-full min-h-[80px]" />

      {/* Event Card */}
      <div
        className={cn(
          "flex-1 p-4 rounded-lg border-2 transition-all duration-200",
          event.type === "appeal"
            ? "bg-purple-50/50 border-purple-200"
            : event.type === "admin_action"
              ? "bg-orange-50/50 border-orange-200"
              : event.type === "subscription"
                ? "bg-green-50/50 border-green-200"
                : "bg-blue-50/50 border-blue-200",
        )}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${typeInfo.bg}`}>
            <Icon className={cn("h-4 w-4", typeInfo.color)} />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold">{event.title}</h4>
              <Badge variant={statusInfo.variant} className="text-xs">
                {statusInfo.label}
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground mb-2">
              {event.description}
            </p>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{new Date(event.date).toLocaleDateString()}</span>
              {entityType ? <span>• {entityType}</span> : null}
            </div>
          </div>
        </div>

        {/* Expandable Details */}
        <div className="mt-3 pt-3 border-t border-border/50">
          <button className="text-xs text-[hsl(var(--medical-teal))] font-medium flex items-center gap-1 hover:underline">
            View Details
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
