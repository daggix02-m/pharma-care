import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/ui";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

import gsap from "gsap";
import {
  Search,
  Plus,
  AlertTriangle,
  Clock,
  DollarSign,
  ClipboardList,
  Pill,
  Trash2,
  Edit,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Medicine {
  _id: Id<"medicines">;
  _creationTime: number;
  branchId: Id<"branches">;
  name: string;
  category: string;
  stock: number;
  price: number;
  minStock?: number;
  type?: string;
  manufacturer?: string;
  barcode?: string;
  expiryDate?: number;
  status?: string;
  genericName?: string;
  prescriptionRequired?: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  onClick?: () => void;
  actionLabel?: string;
}

export function PharmacistDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const validTabs = [
    "overview",
    "medicines",
    "expiry",
    "stock",
    "reports",
  ] as const;
  const activeTab =
    requestedTab &&
    validTabs.includes(requestedTab as (typeof validTabs)[number])
      ? requestedTab
      : "overview";
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, y: 8 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: "power2.out",
            immediateRender: true,
          },
        );
      }
    }, contentRef);
    return () => ctx.revert();
  }, [activeTab]);

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
          Pharmacist Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor branch inventory and medical supplies
        </p>
      </div>

      <Tabs value={activeTab} className="w-full">
        <div ref={contentRef}>
          <TabsContent value="overview" className="mt-0 focus:outline-none">
            <OverviewTab
              onNavigateTab={(tab) => navigate(`/pharmacist?tab=${tab}`)}
            />
          </TabsContent>

          <TabsContent value="medicines" className="mt-0 focus:outline-none">
            <MedicinesTab />
          </TabsContent>

          <TabsContent value="expiry" className="mt-0 focus:outline-none">
            <ExpiryAlertsTab />
          </TabsContent>

          <TabsContent value="stock" className="mt-0 focus:outline-none">
            <StockRequestsTab />
          </TabsContent>

          <TabsContent value="reports" className="mt-0 focus:outline-none">
            <ReportsTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function OverviewTab({
  onNavigateTab,
}: {
  onNavigateTab: (tab: string) => void;
}) {
  const { sessionToken } = useAuth();
  const stats = useQuery(
    api.pharmacist.queries.getDashboardStats,
    sessionToken ? { sessionToken } : "skip",
  );
  const medicines = useQuery(
    api.pharmacist.queries.getMedicines,
    sessionToken ? { sessionToken } : "skip",
  );
  const expiringMedicines = useQuery(
    api.pharmacist.queries.getExpiringMedicines,
    sessionToken ? { sessionToken } : "skip",
  );
  const lowStockMedicines = useQuery(
    api.pharmacist.queries.getLowStockMedicines,
    sessionToken ? { sessionToken } : "skip",
  );
  const loading =
    stats === undefined ||
    medicines === undefined ||
    expiringMedicines === undefined ||
    lowStockMedicines === undefined;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Medicines"
          value={stats.totalMedicines}
          icon={Pill}
          color="text-primary"
          onClick={() => onNavigateTab("medicines")}
          actionLabel="Manage"
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStockItems}
          icon={AlertTriangle}
          color="text-destructive"
          onClick={() => onNavigateTab("stock")}
          actionLabel="Request"
        />
        <StatCard
          title="Near Expiry"
          value={expiringMedicines.length}
          icon={Clock}
          color="text-amber-600"
          onClick={() => onNavigateTab("expiry")}
          actionLabel="Review"
        />
        <StatCard
          title="Today's Sales"
          value={`ETB ${stats.todaySales.toLocaleString()}`}
          icon={DollarSign}
          color="text-primary"
          onClick={() => onNavigateTab("reports")}
          actionLabel="Analyze"
        />
      </div>

      <Card className="minimal-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Quick Actions
          </CardTitle>
          <CardDescription>
            Fast access to critical inventory workflows
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Button variant="outline" onClick={() => onNavigateTab("medicines")}>
            Inventory
          </Button>
          <Button variant="outline" onClick={() => onNavigateTab("expiry")}>
            Expiry Alerts
          </Button>
          <Button variant="outline" onClick={() => onNavigateTab("stock")}>
            Stock Requests
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {lowStockMedicines.length > 0 && (
          <Card className="minimal-card border-destructive/10">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-destructive flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowStockMedicines.slice(0, 4).map((medicine: Medicine) => (
                  <div
                    key={medicine._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-destructive/5 border border-destructive/10"
                  >
                    <span className="font-semibold text-[13px]">
                      {medicine.name}
                    </span>
                    <Badge variant="destructive" className="text-[10px]">
                      {medicine.stock} units left
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="minimal-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringMedicines.slice(0, 4).map((medicine: Medicine) => {
                const days = Math.ceil(
                  (medicine.expiryDate! - Date.now()) / (1000 * 60 * 60 * 24),
                );
                return (
                  <div
                    key={medicine._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/40"
                  >
                    <span className="font-semibold text-[13px]">
                      {medicine.name}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-bold">
                      {days} days
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  onClick,
  actionLabel,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "minimal-card p-6 transition-all",
        onClick ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md" : "",
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {title}
        </p>
        <div
          className={cn(
            "w-8 h-8 rounded-lg bg-secondary flex items-center justify-center",
            color,
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="text-2xl font-display font-bold">{value}</div>
      {actionLabel ? (
        <p className="text-[11px] font-semibold text-primary mt-2 uppercase tracking-wide">
          {actionLabel}
        </p>
      ) : null}
    </Card>
  );
}

function MedicinesTab() {
  const { sessionToken } = useAuth();
  const medicines = useQuery(
    api.pharmacist.queries.getMedicines,
    sessionToken ? { sessionToken } : "skip",
  );
  const loading = medicines === undefined;

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const removeMedicineMutation = useMutation(
    api.pharmacist.mutations.removeMedicine,
  );
  const addMedicineMutation = useMutation(api.pharmacist.mutations.addMedicine);
  const updateMedicineStockMutation = useMutation(
    api.pharmacist.mutations.updateMedicineStock,
  );

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [deletingMedicine, setDeletingMedicine] = useState<Medicine | null>(
    null,
  );

  const [newMedicine, setNewMedicine] = useState({
    name: "",
    category: "",
    stock: "",
    price: "",
    manufacturer: "",
    barcode: "",
  });
  const [editStockValue, setEditStockValue] = useState("");

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

  const getStockBadge = (stock: number) => {
    if (stock <= 10)
      return (
        <Badge variant="destructive" className="text-[10px] px-2">
          Low
        </Badge>
      );
    if (stock <= 20)
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] px-2">
          Medium
        </Badge>
      );
    return (
      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] px-2">
        Good
      </Badge>
    );
  };

  if (loading) return <Skeleton className="h-96 rounded-2xl" />;

  const handleAddMedicine = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !newMedicine.name.trim() ||
      !newMedicine.category.trim() ||
      !newMedicine.stock.trim() ||
      !newMedicine.price.trim()
    ) {
      toast.error("Please fill all required medicine fields");
      return;
    }

    try {
      setSaving(true);
      await addMedicineMutation({
        name: newMedicine.name.trim(),
        category: newMedicine.category.trim(),
        stock: Number(newMedicine.stock),
        price: Number(newMedicine.price),
        manufacturer: newMedicine.manufacturer.trim() || undefined,
        barcode: newMedicine.barcode.trim() || undefined,
      });
      toast.success("Medicine added");
      setAddDialogOpen(false);
      setNewMedicine({
        name: "",
        category: "",
        stock: "",
        price: "",
        manufacturer: "",
        barcode: "",
      });
    } catch (error: any) {
      toast.error(error?.message || "Failed to add medicine");
    } finally {
      setSaving(false);
    }
  };

  const openEditDialog = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setEditStockValue(String(medicine.stock));
    setEditDialogOpen(true);
  };

  const handleUpdateStock = async () => {
    if (!editingMedicine) return;
    const stock = Number(editStockValue);
    if (Number.isNaN(stock) || stock < 0) {
      toast.error("Enter a valid stock value");
      return;
    }

    try {
      setSaving(true);
      await updateMedicineStockMutation({ id: editingMedicine._id, stock });
      toast.success("Stock updated");
      setEditDialogOpen(false);
      setEditingMedicine(null);
      setEditStockValue("");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update stock");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMedicine = async () => {
    if (!deletingMedicine) return;
    try {
      setSaving(true);
      await removeMedicineMutation({ id: deletingMedicine._id });
      toast.success("Medicine removed");
      setDeleteDialogOpen(false);
      setDeletingMedicine(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to remove medicine");
    } finally {
      setSaving(false);
    }
  };

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

      <Card className="minimal-card overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/20">
            <TableRow>
              <TableHead className="py-4 font-bold text-[11px] uppercase tracking-widest pl-6">
                Medicine
              </TableHead>
              <TableHead className="py-4 font-bold text-[11px] uppercase tracking-widest">
                Category
              </TableHead>
              <TableHead className="py-4 font-bold text-[11px] uppercase tracking-widest">
                Stock
              </TableHead>
              <TableHead className="py-4 font-bold text-[11px] uppercase tracking-widest">
                Price
              </TableHead>
              <TableHead className="py-4 font-bold text-[11px] uppercase tracking-widest text-right pr-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMedicines.map((medicine: Medicine) => (
              <TableRow
                key={medicine._id}
                className="hover:bg-secondary/5 transition-colors"
              >
                <TableCell className="py-4 pl-6 font-semibold">
                  {medicine.name}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {medicine.category}
                </TableCell>
                <TableCell>{getStockBadge(medicine.stock)}</TableCell>
                <TableCell className="font-mono text-[13px]">
                  ETB {medicine.price}
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      onClick={() => openEditDialog(medicine)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-destructive"
                      onClick={() => {
                        setDeletingMedicine(medicine);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Medicine</DialogTitle>
            <DialogDescription>
              Create a new inventory medicine record.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMedicine} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="medicine-name">Name</Label>
              <Input
                id="medicine-name"
                value={newMedicine.name}
                onChange={(e) =>
                  setNewMedicine((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="medicine-category">Category</Label>
              <Input
                id="medicine-category"
                value={newMedicine.category}
                onChange={(e) =>
                  setNewMedicine((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="medicine-stock">Stock</Label>
                <Input
                  id="medicine-stock"
                  type="number"
                  min={0}
                  value={newMedicine.stock}
                  onChange={(e) =>
                    setNewMedicine((prev) => ({
                      ...prev,
                      stock: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="medicine-price">Price</Label>
                <Input
                  id="medicine-price"
                  type="number"
                  min={0}
                  step="0.01"
                  value={newMedicine.price}
                  onChange={(e) =>
                    setNewMedicine((prev) => ({
                      ...prev,
                      price: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="medicine-manufacturer">Manufacturer</Label>
                <Input
                  id="medicine-manufacturer"
                  value={newMedicine.manufacturer}
                  onChange={(e) =>
                    setNewMedicine((prev) => ({
                      ...prev,
                      manufacturer: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="medicine-barcode">Barcode</Label>
                <Input
                  id="medicine-barcode"
                  value={newMedicine.barcode}
                  onChange={(e) =>
                    setNewMedicine((prev) => ({
                      ...prev,
                      barcode: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Medicine"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Stock</DialogTitle>
            <DialogDescription>
              Update stock for {editingMedicine?.name || "selected medicine"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="edit-stock">Stock</Label>
              <Input
                id="edit-stock"
                type="number"
                min={0}
                value={editStockValue}
                onChange={(e) => setEditStockValue(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleUpdateStock}
                disabled={saving}
              >
                {saving ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete medicine?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingMedicine?.name} will be removed from inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                void handleDeleteMedicine();
              }}
              disabled={saving}
            >
              {saving ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ExpiryAlertsTab() {
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

function StockRequestsTab() {
  const { sessionToken } = useAuth();
  const medicines = useQuery(
    api.pharmacist.queries.getMedicines,
    sessionToken ? { sessionToken } : "skip",
  );
  const createStockRequest = useMutation(
    api.pharmacist.mutations.createStockRequest,
  );
  const requestTransfer = useMutation(
    (api as any).stockTransfers.requestStockTransfer,
  );
  const transferOptions = useQuery(
    (api as any).stockTransfers.getTransferFormOptions,
    sessionToken ? { sessionToken } : "skip",
  );
  const transferRequests = useQuery(
    (api as any).stockTransfers.getTransferRequestsForPharmacy,
    sessionToken ? { sessionToken } : "skip",
  );
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    medicineId: "",
    quantity: "",
    urgency: "normal",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transferSubmitting, setTransferSubmitting] = useState(false);
  const [transferForm, setTransferForm] = useState({
    toBranchId: "",
    sourceMedicineId: "",
    quantity: "",
    urgency: "normal",
    reason: "",
    notes: "",
  });
  const requests = useQuery(
    api.pharmacist.queries.getStockRequests,
    sessionToken ? { sessionToken } : "skip",
  );
  if (!requests || !medicines) return <Skeleton className="h-96 rounded-2xl" />;

  const handleCreateRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!requestForm.medicineId || !requestForm.quantity) {
      toast.error("Select a medicine and quantity");
      return;
    }

    try {
      setIsSubmitting(true);
      await createStockRequest({
        medicineId: requestForm.medicineId as Id<"medicines">,
        quantity: Number(requestForm.quantity),
        urgency: requestForm.urgency,
        notes: requestForm.notes.trim() || undefined,
      });
      toast.success("Stock request submitted");
      setNewRequestOpen(false);
      setRequestForm({
        medicineId: "",
        quantity: "",
        urgency: "normal",
        notes: "",
      });
    } catch (error: any) {
      toast.error(error?.message || "Failed to create stock request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-display">
          Replenishment Requests
        </h2>
        <Button
          className="rounded-xl h-10 gap-2"
          onClick={() => setNewRequestOpen(true)}
        >
          <Plus className="w-4 h-4" />
          New Request
        </Button>
      </div>
      <div className="grid gap-4">
        {requests.map(
          (r: {
            _id: string;
            medicineName: string;
            quantity: number;
            urgency: string;
            status: string;
          }) => (
            <div
              key={r._id}
              className="minimal-card p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-[15px]">{r.medicineName}</p>
                  <p className="text-xs text-muted-foreground">
                    Qty: {r.quantity} · Urgency:{" "}
                    <span className="capitalize">{r.urgency}</span>
                  </p>
                </div>
              </div>
              <Badge className="capitalize px-3 h-7">{r.status}</Badge>
            </div>
          ),
        )}
      </div>

      <Card className="minimal-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Branch Transfer Request
          </CardTitle>
          <CardDescription>
            Request stock movement from your branch to another branch.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3 md:grid-cols-2"
            onSubmit={async (e) => {
              e.preventDefault();
              if (
                !transferForm.toBranchId ||
                !transferForm.sourceMedicineId ||
                !transferForm.quantity ||
                !transferForm.reason.trim()
              ) {
                toast.error("Please complete all transfer request fields");
                return;
              }

              try {
                setTransferSubmitting(true);
                await requestTransfer({
                  fromBranchId: transferOptions?.actorBranchId,
                  toBranchId: transferForm.toBranchId,
                  sourceMedicineId: transferForm.sourceMedicineId,
                  quantity: Number(transferForm.quantity),
                  urgency: transferForm.urgency,
                  reason: transferForm.reason.trim(),
                  notes: transferForm.notes.trim() || undefined,
                  sessionToken: sessionToken || undefined,
                });
                toast.success("Transfer request submitted");
                setTransferForm({
                  toBranchId: "",
                  sourceMedicineId: "",
                  quantity: "",
                  urgency: "normal",
                  reason: "",
                  notes: "",
                });
              } catch (error: any) {
                toast.error(error?.message || "Failed to request transfer");
              } finally {
                setTransferSubmitting(false);
              }
            }}
          >
            <div className="space-y-1">
              <Label>Destination Branch</Label>
              <select
                value={transferForm.toBranchId}
                onChange={(e) =>
                  setTransferForm((prev) => ({
                    ...prev,
                    toBranchId: e.target.value,
                  }))
                }
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select branch</option>
                {(transferOptions?.branches || [])
                  .filter(
                    (branch: any) =>
                      branch._id !== transferOptions?.actorBranchId,
                  )
                  .map((branch: any) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Medicine</Label>
              <select
                value={transferForm.sourceMedicineId}
                onChange={(e) =>
                  setTransferForm((prev) => ({
                    ...prev,
                    sourceMedicineId: e.target.value,
                  }))
                }
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select medicine</option>
                {(
                  transferOptions?.medicinesBySource?.[
                    transferOptions?.actorBranchId || ""
                  ] || []
                ).map((medicine: any) => (
                  <option key={medicine._id} value={medicine._id}>
                    {medicine.name} (Stock: {medicine.stock})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Quantity</Label>
              <Input
                type="number"
                min={1}
                value={transferForm.quantity}
                onChange={(e) =>
                  setTransferForm((prev) => ({
                    ...prev,
                    quantity: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Urgency</Label>
              <select
                value={transferForm.urgency}
                onChange={(e) =>
                  setTransferForm((prev) => ({
                    ...prev,
                    urgency: e.target.value,
                  }))
                }
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Reason</Label>
              <Input
                value={transferForm.reason}
                onChange={(e) =>
                  setTransferForm((prev) => ({
                    ...prev,
                    reason: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label>Notes</Label>
              <Textarea
                rows={2}
                value={transferForm.notes}
                onChange={(e) =>
                  setTransferForm((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={transferSubmitting}>
                {transferSubmitting
                  ? "Submitting..."
                  : "Submit Transfer Request"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="minimal-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Transfer Request History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(transferRequests || []).map((request: any) => (
            <div
              key={request._id}
              className="rounded-lg border border-border/40 p-3"
            >
              <p className="font-medium text-sm">
                {request.medicineSnapshot?.name} · {request.quantity} units
              </p>
              <p className="text-xs text-muted-foreground">
                {request.fromBranchName} to {request.toBranchName}
              </p>
              <Badge className="capitalize mt-2">
                {request.status.replace(/_/g, " ")}
              </Badge>
            </div>
          ))}
          {!transferRequests?.length && (
            <p className="text-sm text-muted-foreground">
              No transfer requests yet.
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={newRequestOpen} onOpenChange={setNewRequestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Stock Request</DialogTitle>
            <DialogDescription>
              Submit a replenishment request for medicine stock.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateRequest} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="request-medicine">Medicine</Label>
              <select
                id="request-medicine"
                value={requestForm.medicineId}
                onChange={(e) =>
                  setRequestForm((prev) => ({
                    ...prev,
                    medicineId: e.target.value,
                  }))
                }
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select medicine</option>
                {medicines.map((medicine: Medicine) => (
                  <option key={medicine._id} value={medicine._id}>
                    {medicine.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="request-quantity">Quantity</Label>
                <Input
                  id="request-quantity"
                  type="number"
                  min={1}
                  value={requestForm.quantity}
                  onChange={(e) =>
                    setRequestForm((prev) => ({
                      ...prev,
                      quantity: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="request-urgency">Urgency</Label>
                <select
                  id="request-urgency"
                  value={requestForm.urgency}
                  onChange={(e) =>
                    setRequestForm((prev) => ({
                      ...prev,
                      urgency: e.target.value,
                    }))
                  }
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="request-notes">Notes</Label>
              <Textarea
                id="request-notes"
                rows={3}
                value={requestForm.notes}
                onChange={(e) =>
                  setRequestForm((prev) => ({ ...prev, notes: e.target.value }))
                }
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setNewRequestOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReportsTab() {
  const { sessionToken } = useAuth();
  const medicines = useQuery(
    api.pharmacist.queries.getMedicines,
    sessionToken ? { sessionToken } : "skip",
  );
  if (!medicines) return <Skeleton className="h-96 rounded-2xl" />;

  const stockValuation = medicines.reduce((sum: number, medicine: any) => {
    const price = typeof medicine.price === "number" ? medicine.price : 0;
    const stock = typeof medicine.stock === "number" ? medicine.stock : 0;
    return sum + price * stock;
  }, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="minimal-card lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Inventory Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-2xl">
            Analytics Visualization Placeholder
          </div>
        </CardContent>
      </Card>
      <Card className="minimal-card">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Stock Valuation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center py-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Total Assets
            </p>
            <p className="text-4xl font-display font-bold">
              ETB {stockValuation.toLocaleString()}
            </p>
          </div>
          <div className="pt-6 border-t border-border/40">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Items Tracked
            </p>
            <p className="text-2xl font-bold">{medicines.length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
