import { useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import type { Medicine } from "./types";

export function ExpiryAlertsSection() {
  const { sessionToken } = useAuth();
  const markMedicineForReturn = useMutation(
    api.pharmacist.mutations.markMedicineForReturn,
  );
  const medicines = useQuery(
    api.pharmacist.queries.getMedicines,
    sessionToken ? { sessionToken } : "skip",
  );
  const filteredMedicines = useMemo(() => {
    if (!medicines) return [];
    const thirtyDays = Date.now() + 30 * 24 * 60 * 60 * 1000;
    return medicines.filter(
      (m: Medicine) => m.expiryDate && m.expiryDate <= thirtyDays,
    );
  }, [medicines]);

  if (!medicines) return <Skeleton className="h-96 rounded-2xl" />;

  return (
    <div className="space-y-6">
      <Card className="minimal-card bg-destructive/5 border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive font-bold flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" />
            Critical Expiry Watchlist
          </CardTitle>
          <CardDescription>
            Items identified for immediate return or disposal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMedicines.map((m: Medicine) => (
              <div
                key={m._id}
                className="p-4 rounded-xl bg-background border border-destructive/10 flex flex-col justify-between"
              >
                <div>
                  <p className="font-bold text-[14px] mb-1">{m.name}</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Exp: {new Date(m.expiryDate!).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full rounded-lg h-8 text-[11px] font-bold uppercase tracking-wider"
                  onClick={async () => {
                    try {
                      await markMedicineForReturn({
                        id: m._id,
                        reason: "Marked from expiry alerts",
                      });
                      toast.success(`${m.name} marked for return`);
                    } catch (error: any) {
                      toast.error(error?.message || "Failed to mark medicine");
                    }
                  }}
                >
                  Mark for Return
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
