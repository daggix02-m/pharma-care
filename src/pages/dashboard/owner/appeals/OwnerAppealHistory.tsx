import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { ShieldAlert, UserX, FileText, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import {
  ManagerFlagCard,
  AdminActionCard,
  type ManagerFlagAppeal,
  type AdminActionAppeal,
} from "./AppealCards";

export function OwnerAppealHistory() {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<
    "all" | "manager_flags" | "admin_actions"
  >("all");
  const { sessionToken } = useAuth();

  const appealHistory = useQuery(
    api.owner.queries.getAppealHistory,
    sessionToken ? { sessionToken } : "skip",
  );

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (appealHistory === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Appeal History
        </h2>
        <p className="text-muted-foreground">
          Track the status of your appeals and responses from administrators
        </p>
      </div>

      {appealHistory.totalAppeals === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-emerald-600/20 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Appeals History</h3>
            <p className="text-muted-foreground text-center max-w-md">
              You haven't submitted any appeals yet. Appeals will appear here
              when they're created.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">
                All Appeals ({appealHistory.totalAppeals})
              </TabsTrigger>
              <TabsTrigger value="manager_flags">
                Manager Flags ({appealHistory.managerFlagAppeals.length})
              </TabsTrigger>
              <TabsTrigger value="admin_actions">
                Admin Actions ({appealHistory.adminActionAppeals.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-6">
              <div className="space-y-3">
                {appealHistory.managerFlagAppeals.map(
                  (appeal: ManagerFlagAppeal) => (
                    <ManagerFlagCard
                      key={appeal.id}
                      appeal={appeal}
                      isExpanded={expandedCards.has(appeal.id)}
                      onToggle={toggleCard}
                    />
                  ),
                )}
                {appealHistory.adminActionAppeals.map(
                  (appeal: AdminActionAppeal) => (
                    <AdminActionCard
                      key={appeal.id}
                      appeal={appeal}
                      isExpanded={expandedCards.has(appeal.id)}
                      onToggle={toggleCard}
                    />
                  ),
                )}
              </div>
            </TabsContent>

            <TabsContent value="manager_flags" className="space-y-4 mt-6">
              {appealHistory.managerFlagAppeals.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <ShieldAlert className="h-12 w-12 text-emerald-600/20 mb-3" />
                    <p className="text-muted-foreground">
                      No manager flag appeals
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {appealHistory.managerFlagAppeals.map(
                    (appeal: ManagerFlagAppeal) => (
                      <ManagerFlagCard
                        key={appeal.id}
                        appeal={appeal}
                        isExpanded={expandedCards.has(appeal.id)}
                        onToggle={toggleCard}
                      />
                    ),
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="admin_actions" className="space-y-4 mt-6">
              {appealHistory.adminActionAppeals.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <UserX className="h-12 w-12 text-emerald-600/20 mb-3" />
                    <p className="text-muted-foreground">
                      No admin action appeals
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {appealHistory.adminActionAppeals.map(
                    (appeal: AdminActionAppeal) => (
                      <AdminActionCard
                        key={appeal.id}
                        appeal={appeal}
                        isExpanded={expandedCards.has(appeal.id)}
                        onToggle={toggleCard}
                      />
                    ),
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
