import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { TrendingUp, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatActionLabel } from "./helpers";

export function SystemActivityCard({
  sessionToken,
}: {
  sessionToken: string | null;
}) {
  const navigate = useNavigate();
  const [auditSearch, setAuditSearch] = useState("");
  const [auditActionFilter, setAuditActionFilter] = useState<string>("all");

  const recentAuditLogs = useQuery(
    api.admin.queries.getAuditLogs,
    sessionToken ? { sessionToken } : "skip",
  );

  const auditActionOptions = useMemo(() => {
    const actions = new Set<string>();
    (recentAuditLogs || []).forEach((log: any) => {
      if (log.action) actions.add(String(log.action));
    });
    return ["all", ...Array.from(actions).slice(0, 8)];
  }, [recentAuditLogs]);

  const recentActions = useMemo(() => {
    const logs = recentAuditLogs || [];
    const actionFilter = auditActionFilter.trim().toLowerCase();
    const searchFilter = auditSearch.trim().toLowerCase();

    return logs
      .filter((log: any) => {
        const action = String(log.action || "").toLowerCase();
        const details = String(log.details || "").toLowerCase();
        const name = String(log.user_name || "").toLowerCase();

        if (actionFilter !== "all" && action !== actionFilter) {
          return false;
        }

        if (!searchFilter) {
          return true;
        }

        return (
          action.includes(searchFilter) ||
          details.includes(searchFilter) ||
          name.includes(searchFilter)
        );
      })
      .slice(0, 5);
  }, [recentAuditLogs, auditActionFilter, auditSearch]);

  return (
    <Card className="minimal-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-[14px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          System Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-3">
          <Input
            value={auditSearch}
            onChange={(e) => setAuditSearch(e.target.value)}
            placeholder="Search actions, details, actor..."
            className="h-9"
          />
          <div className="flex flex-wrap gap-2">
            {auditActionOptions.map((option) => (
              <Button
                key={option}
                variant={auditActionFilter === option ? "default" : "outline"}
                size="sm"
                className="h-7 px-2 text-[10px] uppercase tracking-wide"
                onClick={() => setAuditActionFilter(option)}
              >
                {option === "all" ? "All Actions" : formatActionLabel(option)}
              </Button>
            ))}
          </div>
        </div>

        {recentActions.length > 0 ? (
          <div className="space-y-2">
            {recentActions.map((log: any) => (
              <div
                key={log._id}
                className="flex items-center gap-4 p-4 rounded-xl border border-border/40"
              >
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                  <Activity className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-medium">
                    {formatActionLabel(log.action || "activity")}
                  </p>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-tight">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No activity matches your filters
          </div>
        )}
        <Button
          variant="secondary"
          size="sm"
          className="w-full mt-3"
          onClick={() => navigate("/admin?tab=audit-logs")}
        >
          View Full Audit Logs
        </Button>
      </CardContent>
    </Card>
  );
}
