import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface AppealFiltersProps {
  totalPending: number;
  managerCount: number;
  adminCount: number;
  visibleCount: number;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  appealTypeFilter: "all" | "manager" | "admin";
  onAppealTypeFilterChange: (value: "all" | "manager" | "admin") => void;
}

const FILTER_OPTIONS = [
  { value: "all" as const, label: "All" },
  { value: "manager" as const, label: "Manager" },
  { value: "admin" as const, label: "Admin Action" },
];

export function AppealFilters({
  totalPending,
  managerCount,
  adminCount,
  visibleCount,
  searchQuery,
  onSearchQueryChange,
  appealTypeFilter,
  onAppealTypeFilterChange,
}: AppealFiltersProps) {
  return (
    <Card className="border border-border/60">
      <CardContent className="p-4 space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <Badge variant="outline" className="justify-center py-2">
            Total Pending: {totalPending}
          </Badge>
          <Badge variant="outline" className="justify-center py-2">
            Manager: {managerCount}
          </Badge>
          <Badge variant="outline" className="justify-center py-2">
            Admin Action: {adminCount}
          </Badge>
          <Badge variant="secondary" className="justify-center py-2">
            Visible: {visibleCount}
          </Badge>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search by manager, owner, pharmacy, or reason..."
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {FILTER_OPTIONS.map((option) => (
              <Button
                key={option.value}
                size="sm"
                variant={
                  appealTypeFilter === option.value ? "default" : "outline"
                }
                onClick={() => onAppealTypeFilterChange(option.value)}
                className="h-9 text-[12px]"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
