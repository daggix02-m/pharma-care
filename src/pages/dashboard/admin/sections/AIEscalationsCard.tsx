import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { formatActionLabel } from "./helpers";

export function AIEscalationsCard({
  sessionToken,
  aiEscalationsToday,
  aiEscalationsPending,
}: {
  sessionToken: string | null;
  aiEscalationsToday: number;
  aiEscalationsPending: number;
}) {
  const [escalationStatusFilter, setEscalationStatusFilter] = useState<
    "all" | "pending" | "resolved"
  >("pending");
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedEscalationId, setSelectedEscalationId] =
    useState<Id<"ai_escalations"> | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [resolvingEscalation, setResolvingEscalation] = useState(false);

  const escalationList = useQuery(
    api.ai.queries.getEscalations,
    sessionToken
      ? {
          sessionToken,
          status:
            escalationStatusFilter === "all"
              ? undefined
              : escalationStatusFilter,
        }
      : "skip",
  );
  const resolveEscalation = useMutation(api.admin.mutations.resolveEscalation);

  const filteredEscalations = useMemo(() => {
    if (!escalationList) return [];
    return escalationList.slice(0, 6);
  }, [escalationList]);

  const handleResolveEscalation = async () => {
    if (!selectedEscalationId) return;
    if (!resolutionNote.trim()) {
      toast.error("Resolution note is required");
      return;
    }

    setResolvingEscalation(true);
    try {
      await resolveEscalation({
        escalationId: selectedEscalationId,
        resolution: resolutionNote.trim(),
      });
      toast.success("Escalation resolved successfully");
      setResolveDialogOpen(false);
      setResolutionNote("");
      setSelectedEscalationId(null);
    } catch {
      toast.error("Failed to resolve escalation");
    } finally {
      setResolvingEscalation(false);
    }
  };

  return (
    <>
      <Card className="minimal-card border-l-4 border-l-blue-500">
        <CardHeader className="pb-4">
          <CardTitle className="text-[14px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            AI Assistant Escalations
            {aiEscalationsPending > 0 && (
              <Badge variant="secondary" className="ml-2">
                {aiEscalationsPending}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-blue-50/30">
              <div>
                <p className="font-semibold text-[14px]">
                  Today&apos;s Escalations
                </p>
                <p className="text-[12px] text-muted-foreground">
                  {aiEscalationsToday} new today
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-700">
                  {aiEscalationsPending}
                </p>
                <p className="text-[10px] text-muted-foreground">pending</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(["all", "pending", "resolved"] as const).map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={
                    escalationStatusFilter === status ? "default" : "outline"
                  }
                  className="h-8 text-[11px] capitalize"
                  onClick={() => setEscalationStatusFilter(status)}
                >
                  {status}
                </Button>
              ))}
            </div>

            {filteredEscalations.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm rounded-xl border border-dashed">
                No escalations in this filter.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredEscalations.map((escalation: any) => (
                  <div
                    key={escalation._id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/50 bg-background"
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold truncate">
                        {escalation.pharmacy?.name || "Unassigned Pharmacy"}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {escalation.user?.name || "Unknown user"} &bull;{" "}
                        {formatActionLabel(escalation.type || "escalation")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] capitalize",
                          escalation.status === "pending"
                            ? "border-amber-300 text-amber-700 bg-amber-50"
                            : "border-emerald-300 text-emerald-700 bg-emerald-50",
                        )}
                      >
                        {escalation.status}
                      </Badge>
                      {escalation.status === "pending" ? (
                        <Button
                          size="sm"
                          className="h-8 text-[11px]"
                          onClick={() => {
                            setSelectedEscalationId(escalation._id);
                            setResolutionNote("");
                            setResolveDialogOpen(true);
                          }}
                        >
                          Resolve
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resolve AI Escalation</AlertDialogTitle>
            <AlertDialogDescription>
              Add a resolution note so this action is documented in the audit
              trail.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
            placeholder="Describe what was done to resolve this issue"
            className="min-h-[110px]"
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resolvingEscalation}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleResolveEscalation();
              }}
              disabled={resolvingEscalation}
            >
              {resolvingEscalation ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resolving...
                </span>
              ) : (
                "Resolve Escalation"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
