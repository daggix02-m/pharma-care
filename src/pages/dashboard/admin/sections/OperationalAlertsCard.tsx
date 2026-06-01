import { useNavigate } from "react-router-dom";
import { Flag, Users, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FlaggedAccount {
  _id: string;
  full_name: string;
  pharmacyName: string;
  pharmacyId?: string;
}

interface AppealPreview {
  id: string;
  type: string;
  owner: string;
}

export function OperationalAlertsCard({
  flaggedAccounts,
  pendingAppealsPreview,
  flaggedCount,
  pendingAppealsCount,
}: {
  flaggedAccounts: FlaggedAccount[];
  pendingAppealsPreview: AppealPreview[];
  flaggedCount: number;
  pendingAppealsCount: number;
}) {
  const navigate = useNavigate();
  const hasAlerts = flaggedCount > 0 || pendingAppealsCount > 0;

  return (
    <Card className="minimal-card border-l-4 border-l-amber-500">
      <CardHeader className="pb-4">
        <CardTitle className="text-[14px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Flag className="w-4 h-4 text-amber-600" />
          Operational Alerts
          {hasAlerts && (
            <Badge variant="destructive" className="ml-2">
              {flaggedCount + pendingAppealsCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasAlerts ? (
          <div className="space-y-3">
            {flaggedAccounts.slice(0, 3).map((account) => (
              <div
                key={account._id}
                className="flex items-center justify-between p-4 rounded-xl border border-border/40 hover:border-amber-300 transition-colors bg-amber-50/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-[14px]">
                      {account.full_name}
                    </p>
                    <p className="text-[12px] text-muted-foreground">
                      {account.pharmacyName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-amber-100 text-amber-800 border-amber-300"
                  >
                    Flagged
                  </Badge>
                  {account.pharmacyId ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-[11px]"
                      onClick={() =>
                        navigate(`/admin/pharmacies/${account.pharmacyId}`)
                      }
                    >
                      Open
                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
            {pendingAppealsPreview.map((appeal) => (
              <div
                key={appeal.id}
                className="flex items-center justify-between p-4 rounded-xl border border-border/40 hover:border-blue-300 transition-colors bg-blue-50/30"
              >
                <div>
                  <p className="font-semibold text-[14px]">{appeal.type}</p>
                  <p className="text-[12px] text-muted-foreground">
                    From: {appeal.owner}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-[11px]"
                  onClick={() => navigate("/admin/appeals")}
                >
                  Review
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            ))}
            <Button
              variant="secondary"
              size="sm"
              className="w-full mt-2"
              onClick={() => navigate("/admin/appeals")}
            >
              Open Appeal Review Queue
            </Button>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Flag className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No operational alerts</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
