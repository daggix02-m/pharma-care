import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

export function SettingsSection() {
  const { sessionToken } = useAuth();
  const pharmacyData = useQuery(
    api.manager.queries.getMyPharmacy,
    sessionToken ? { sessionToken } : "skip",
  );
  const loading = pharmacyData === undefined;
  if (loading) return <Skeleton className="h-96 rounded-2xl" />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="minimal-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Pharmacy Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Pharmacy Name
              </p>
              <p className="font-semibold text-lg">{pharmacyData?.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                License Code
              </p>
              <p className="font-mono text-sm">{pharmacyData?.licenseCode}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Subscription
              </p>
              <Badge className="capitalize">
                {pharmacyData?.subscriptionTier}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Status
              </p>
              <Badge variant="outline">{pharmacyData?.status}</Badge>
            </div>
          </div>
          <div className="pt-6 border-t border-border/40">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
              Invite Code
            </p>
            <div className="flex items-center gap-4">
              <div className="h-11 px-4 rounded-xl bg-secondary/20 border border-border/40 flex items-center font-mono font-bold text-primary flex-1">
                {pharmacyData?.inviteCode}
              </div>
              <Button variant="outline" className="h-11 rounded-xl gap-2">
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
