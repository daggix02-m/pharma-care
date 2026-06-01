import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  Building2,
  Store,
  Users,
  MapPin,
  Search,
  Loader2,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatDateTime } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import type { Pharmacy } from "./types";
import { getPharmacyLocationLabel } from "./helpers";

export function PharmaciesSection() {
  const { sessionToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const pharmacies = useQuery(
    api.admin.queries.getPharmacies,
    sessionToken ? { sessionToken } : "skip",
  );
  const deletePharmacy = useMutation(api.admin.mutations.deletePharmacy);

  const isLoading = pharmacies === undefined;

  const filteredPharmacies = useMemo(() => {
    if (!pharmacies) return [];
    return pharmacies.filter((p: Pharmacy) => {
      const isApproved = p.status === "active" || p.status === "approved";
      if (!isApproved) return false;

      const matchesSearch =
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.pharmacyEmail?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [pharmacies, searchQuery]);

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <Input
            placeholder="Search pharmacies by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 rounded-xl"
          />
        </div>
        <div />
      </div>

      <div className="space-y-4">
        {filteredPharmacies.length === 0 && (
          <Card className="minimal-card">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No approved pharmacies match your search.
            </CardContent>
          </Card>
        )}
        {filteredPharmacies.map((pharmacy: Pharmacy) => {
          const plannedBranchCount = pharmacy.plannedBranches || 0;
          const plannedManagerCount =
            pharmacy.plannedStaffBreakdown?.managers || 0;

          return (
            <Card
              key={pharmacy._id}
              className="minimal-card overflow-hidden transition-all duration-300 hover:border-primary/40"
            >
              <CardContent className="p-5">
                <div
                  className="flex items-start gap-4 cursor-pointer"
                  onClick={() => navigate(`/admin/pharmacies/${pharmacy._id}`)}
                >
                  <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-primary shrink-0">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-base truncate">
                          {pharmacy.name}
                        </h3>
                        <p className="text-[12px] text-muted-foreground mt-0.5">
                          {pharmacy.pharmacyEmail || "No pharmacy email"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                            pharmacy.status === "active" ||
                              pharmacy.status === "approved"
                              ? "bg-primary/5 text-primary border-primary/20"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {pharmacy.status}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-medium"
                        >
                          Dashboard
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-[12px] text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5" />
                        <span>{plannedBranchCount} planned branches</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        <span>{plannedManagerCount} planned managers</span>
                      </div>
                      {(pharmacy.selectedTier || pharmacy.subscriptionTier) && (
                        <Badge
                          variant="outline"
                          className="text-[10px] font-medium"
                        >
                          {(
                            pharmacy.selectedTier || pharmacy.subscriptionTier
                          )?.toUpperCase()}
                        </Badge>
                      )}
                      {pharmacy.recommendedTier && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-medium"
                        >
                          Rec: {pharmacy.recommendedTier.toUpperCase()}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-2">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-full sm:max-w-[300px]">
                        {getPharmacyLocationLabel(pharmacy)}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                      <p>
                        <span className="font-semibold text-foreground">
                          Owner:
                        </span>{" "}
                        {pharmacy.ownerName || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold text-foreground">
                          Owner Email:
                        </span>{" "}
                        {pharmacy.ownerEmail || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold text-foreground">
                          Owner Phone:
                        </span>{" "}
                        {pharmacy.ownerPhone || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold text-foreground">
                          License:
                        </span>{" "}
                        {pharmacy.licenseCode || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold text-foreground">
                          Planned Branches:
                        </span>{" "}
                        {pharmacy.plannedBranches ?? "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold text-foreground">
                          Planned Staff:
                        </span>{" "}
                        {pharmacy.plannedStaffTotal ?? "N/A"}
                      </p>
                      <p className="sm:col-span-2">
                        <span className="font-semibold text-foreground">
                          Branch Locations:
                        </span>{" "}
                        {pharmacy.plannedBranchLocations?.length
                          ? pharmacy.plannedBranchLocations.join(", ")
                          : "N/A"}
                      </p>
                      <p className="sm:col-span-2">
                        <span className="font-semibold text-foreground">
                          Staff Breakdown:
                        </span>{" "}
                        {pharmacy.plannedStaffBreakdown
                          ? `${pharmacy.plannedStaffBreakdown.pharmacists || 0} pharmacists, ${pharmacy.plannedStaffBreakdown.managers || 0} managers, ${pharmacy.plannedStaffBreakdown.cashiers || 0} cashiers`
                          : "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold text-foreground">
                          Submitted:
                        </span>{" "}
                        {pharmacy.submittedAt
                          ? formatDateTime(pharmacy.submittedAt)
                          : "N/A"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                      <div className="rounded-lg border border-border/50 bg-background p-2">
                        <p className="text-[10px] uppercase text-muted-foreground">
                          Planned Branches
                        </p>
                        <p className="text-sm font-semibold">
                          {plannedBranchCount}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border/50 bg-background p-2">
                        <p className="text-[10px] uppercase text-muted-foreground">
                          Planned Managers
                        </p>
                        <p className="text-sm font-semibold">
                          {plannedManagerCount}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border/50 bg-background p-2">
                        <p className="text-[10px] uppercase text-muted-foreground">
                          Planned Staff
                        </p>
                        <p className="text-sm font-semibold">
                          {pharmacy.plannedStaffTotal ?? "N/A"}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border/50 bg-background p-2">
                        <p className="text-[10px] uppercase text-muted-foreground">
                          Payment
                        </p>
                        <p className="text-sm font-semibold">
                          {pharmacy.paymentStatus || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-border/40">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-[11px] font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/pharmacies/${pharmacy._id}`);
                    }}
                  >
                    <ExternalLink className="w-3 h-3 mr-1.5" />
                    Open Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm("Delete this pharmacy?"))
                        deletePharmacy({ id: pharmacy._id });
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
