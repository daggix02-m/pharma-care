import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BranchesSectionProps {
  pharmacy: any;
}

export function BranchesSection({ pharmacy }: BranchesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Branch Management</CardTitle>
      </CardHeader>
      <CardContent>
        {pharmacy?.branches?.length ? (
          <div className="space-y-3">
            {pharmacy.branches.map((branch: any) => (
              <div
                key={branch._id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border border-border/40 rounded-lg p-3"
              >
                <div>
                  <p className="font-medium">{branch.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {branch.address || "Address not provided"}
                  </p>
                </div>
                <Badge
                  variant={branch.status === "active" ? "default" : "secondary"}
                >
                  {branch.status || "unknown"}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No branches found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
