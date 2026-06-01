import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Activity, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StatPill } from "./helpers";
import { useAuth } from "@/contexts/AuthContext";

export function AuditLogsSection() {
  const { sessionToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const logs = useQuery(
    api.admin.queries.getAuditLogs,
    sessionToken ? { sessionToken } : "skip",
  );

  const formattedAction = (action: string) =>
    action
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  const actionOptions = useMemo(() => {
    if (!logs) return ["all"];
    const unique = Array.from(new Set(logs.map((log: any) => log.action)));
    return ["all", ...unique.slice(0, 10)];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    const query = searchQuery.trim().toLowerCase();
    return logs
      .filter((log: any) =>
        actionFilter === "all" ? true : String(log.action) === actionFilter,
      )
      .filter((log: any) => {
        if (!query) return true;
        return [
          String(log.action || ""),
          String(log.details || ""),
          String(log.user_name || ""),
          String(log.user_email || ""),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .slice(0, 30);
  }, [logs, actionFilter, searchQuery]);

  if (!logs)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <Card className="minimal-card">
        <CardContent className="p-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatPill label="Showing" value={filteredLogs.length} />
            <StatPill label="Total logs" value={logs.length} />
            <StatPill
              label="Unique actions"
              value={Math.max(actionOptions.length - 1, 0)}
            />
            <StatPill
              label="Active filter"
              value={formattedAction(actionFilter)}
            />
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by action, actor, or details..."
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {actionOptions.map((action) => (
                <Button
                  key={action}
                  variant={actionFilter === action ? "default" : "outline"}
                  size="sm"
                  className="h-8 text-[11px]"
                  onClick={() => setActionFilter(action)}
                >
                  {action === "all" ? "All Actions" : formattedAction(action)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredLogs.length === 0 ? (
        <Card className="minimal-card">
          <CardContent className="py-12 text-center text-muted-foreground">
            No audit logs match the current filters.
          </CardContent>
        </Card>
      ) : (
        filteredLogs.map((log: any, idx: number) => (
          <div
            key={log._id || idx}
            className="flex gap-4 p-4 rounded-2xl border border-border/40 bg-card hover:border-border transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-[14px]">
                  {formattedAction(log.action || "activity")}
                </p>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground line-clamp-2">
                {log.details || "System event recorded"}
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">
                  {log.user_name?.charAt(0)}
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {log.user_name} ({log.user_email})
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
