import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { MedicineTable } from "./MedicineTable";
import { AddMedicineDialog } from "./AddMedicineDialog";
import { EditStockDialog } from "./EditStockDialog";
import { DeleteMedicineDialog } from "./DeleteMedicineDialog";
import type { Medicine } from "./types";

export function MedicinesSection() {
  const { sessionToken } = useAuth();
  const medicines = useQuery(
    api.pharmacist.queries.getMedicines,
    sessionToken ? { sessionToken } : "skip",
  );
  const loading = medicines === undefined;

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [deletingMedicine, setDeletingMedicine] = useState<Medicine | null>(
    null,
  );

  const categories = useMemo(() => {
    if (!medicines) return [] as string[];
    const cats = medicines
      .map((m: Medicine) => m.category)
      .filter((c: string | undefined): c is string => Boolean(c));
    return [...new Set(cats)] as string[];
  }, [medicines]);

  const filteredMedicines = useMemo(() => {
    if (!medicines) return [];
    let filtered = [...medicines];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m: Medicine) =>
          m.name?.toLowerCase().includes(q) ||
          m.barcode?.toLowerCase().includes(q),
      );
    }
    if (categoryFilter !== "all")
      filtered = filtered.filter(
        (m: Medicine) => m.category === categoryFilter,
      );
    return filtered;
  }, [medicines, searchQuery, categoryFilter]);

  const openEditDialog = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (medicine: Medicine) => {
    setDeletingMedicine(medicine);
    setDeleteDialogOpen(true);
  };

  if (loading) return <Skeleton className="h-96 rounded-2xl" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
          <Input
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 rounded-xl"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-11 rounded-xl w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            className="rounded-xl h-11 px-6 gap-2"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        </div>
      </div>

      <MedicineTable
        medicines={filteredMedicines}
        onEdit={openEditDialog}
        onDelete={openDeleteDialog}
      />

      <AddMedicineDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />

      <EditStockDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        medicine={editingMedicine}
      />

      <DeleteMedicineDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        medicine={deletingMedicine}
      />
    </div>
  );
}
