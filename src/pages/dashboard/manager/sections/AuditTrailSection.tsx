import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Search, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import type { AuditLog } from "./types";

const PAGE_SIZE = 15;

export function AuditTrailSection() {
  const { sessionToken } = useAuth();
  const logs = useQuery(
    api.manager.queries.getAuditTrail,
    sessionToken ? { sessionToken } : "skip",
  );
  const loading = logs === undefined;
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage] = useState(1);

  const getActionType = (action: string) => {
    const a = (action || "").toLowerCase();
    if (a.includes("create") || a.includes("add")) return "create";
    if (a.includes("update") || a.includes("edit")) return "update";
    if (a.includes("delete") || a.includes("remove")) return "delete";
    if (a.includes("stock") || a.includes("inventory") || a.includes("import"))
      return "inventory";
    return "other";
  };

  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    return logs.filter((log: AuditLog) => {
      const matchesSearch =
        (log.action || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.details || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        filterType === "all" || getActionType(log.action || "") === filterType;
      return matchesSearch && matchesType;
    });
  }, [logs, searchTerm, filterType]);

  const paginatedLogs = useMemo(
    () =>
      filteredLogs.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
      ),
    [filteredLogs, currentPage],
  );

  if (loading)
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display">Audit Trail</h2>
          <p className="text-muted-foreground text-sm">System activity logs</p>
        </div>
      </div>

      <Card className="minimal-card overflow-hidden">
        <div className="p-4 bg-secondary/10 border-b border-border/40 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <Input
              placeholder="Filter activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-background border-border/40"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "All" },
              { value: "create", label: "Create" },
              { value: "update", label: "Update" },
              { value: "delete", label: "Delete" },
              { value: "inventory", label: "Inventory" },
            ].map((type) => (
              <Button
                key={type.value}
                size="sm"
                variant={filterType === type.value ? "default" : "outline"}
                onClick={() => setFilterType(type.value)}
                className="h-8 text-[11px]"
              >
                {type.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-border/40">
          {paginatedLogs.map((log: AuditLog) => (
            <div
              key={log._id}
              className="p-5 flex gap-4 hover:bg-secondary/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-bold text-[14px]">{log.action}</p>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {new Date(log.timestamp || Date.now()).toLocaleString()}
                  </span>
                </div>
                <p className="text-[13px] text-muted-foreground">
                  {log.details || "No details available"}
                </p>
              </div>
            </div>
          ))}
          {paginatedLogs.length === 0 && (
            <div className="py-20 text-center text-muted-foreground">
              No activities found.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
