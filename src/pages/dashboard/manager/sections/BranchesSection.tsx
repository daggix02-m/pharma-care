import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { useAuth } from "@/contexts/AuthContext";
import type { Branch } from "./types";

export function BranchesSection() {
  const { sessionToken } = useAuth();
  const branches = useQuery(
    api.manager.queries.getBranches,
    sessionToken ? { sessionToken } : "skip",
  );
  const pendingBranches = useQuery(
    api.manager.queries.getPendingBranches,
    sessionToken ? { sessionToken } : "skip",
  );
  const loading = branches === undefined || pendingBranches === undefined;

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [newBranch, setNewBranch] = useState({ name: "", address: "" });
  const [editBranch, setEditBranch] = useState({ name: "", address: "" });

  const requestBranchMutation = useMutation(
    api.manager.mutations.requestBranch,
  );
  const updateBranchMutation = useMutation(api.manager.mutations.updateBranch);
  const removeBranchMutation = useMutation(api.manager.mutations.removeBranch);

  const handleAddBranch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newBranch.name.trim()) {
      toast.error("Branch name is required");
      return;
    }
    try {
      await requestBranchMutation({
        name: newBranch.name.trim(),
        address: newBranch.address.trim(),
      });
      toast.success("Branch request submitted");
      setShowAddDialog(false);
      setNewBranch({ name: "", address: "" });
    } catch (err) {
      toast.error((err as Error).message || "Failed to request branch");
    }
  };

  const handleUpdateBranch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedBranch) return;
    try {
      await updateBranchMutation({
        id: selectedBranch._id,
        data: {
          name: editBranch.name.trim(),
          address: editBranch.address.trim(),
        },
      });
      toast.success("Branch updated");
      setShowEditDialog(false);
      setSelectedBranch(null);
    } catch (err) {
      toast.error((err as Error).message || "Failed to update branch");
    }
  };

  const handleDeleteBranch = async () => {
    if (!selectedBranch) return;
    try {
      await removeBranchMutation({ id: selectedBranch._id });
      toast.success("Branch deleted");
      setShowDeleteDialog(false);
      setSelectedBranch(null);
    } catch (err) {
      toast.error((err as Error).message || "Failed to delete branch");
    }
  };

  const openEditDialog = (branch: Branch) => {
    setSelectedBranch(branch);
    setEditBranch({ name: branch.name, address: branch.address || "" });
    setShowEditDialog(true);
  };

  if (loading)
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-2xl" />
        ))}
      </div>
    );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-display">Pharmacy Branches</h2>
          <p className="text-muted-foreground text-sm">
            Manage physical locations
          </p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="rounded-xl h-10 gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Branch
        </Button>
      </div>

      {pendingBranches && pendingBranches.length > 0 && (
        <Card className="border-primary/10 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-[14px] font-bold uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {pendingBranches.map((branch: Branch) => (
                <div
                  key={branch._id}
                  className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border/40"
                >
                  <div>
                    <p className="font-bold text-[14px]">{branch.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {branch.address || "No address"}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-bold uppercase tracking-widest"
                  >
                    Awaiting Approval
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map((branch: Branch) => (
          <Card key={branch._id} className="minimal-card">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">
                    {branch.name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3 h-3" />{" "}
                    {branch.address || "No address"}
                  </p>
                </div>
                <Badge
                  variant={branch.status === "active" ? "default" : "outline"}
                  className="text-[10px] font-bold uppercase"
                >
                  {branch.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 pt-4 border-t border-border/40">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(branch)}
                  className="rounded-lg h-8 flex-1 gap-1.5"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg h-8 px-3 text-destructive hover:bg-destructive/5 border-border/60"
                  onClick={() => {
                    setSelectedBranch(branch);
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add New Branch</DialogTitle>
            <DialogDescription>
              Request a new branch for your pharmacy
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddBranch}>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Branch Name</Label>
                <Input
                  id="name"
                  value={newBranch.name}
                  onChange={(e) =>
                    setNewBranch({ ...newBranch, name: e.target.value })
                  }
                  placeholder="e.g. Downtown Central"
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  value={newBranch.address}
                  onChange={(e) =>
                    setNewBranch({ ...newBranch, address: e.target.value })
                  }
                  placeholder="e.g. 123 Health Ave, Suite 100"
                  className="rounded-xl h-11"
                />
              </div>
            </div>
            <DialogFooter className="mt-8">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAddDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl h-11 px-8">
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
            <DialogDescription>Update branch details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateBranch}>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-name">Branch Name</Label>
                <Input
                  id="edit-name"
                  value={editBranch.name}
                  onChange={(e) =>
                    setEditBranch({ ...editBranch, name: e.target.value })
                  }
                  className="rounded-xl h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-address">Full Address</Label>
                <Input
                  id="edit-address"
                  value={editBranch.address}
                  onChange={(e) =>
                    setEditBranch({ ...editBranch, address: e.target.value })
                  }
                  className="rounded-xl h-11"
                />
              </div>
            </div>
            <DialogFooter className="mt-8">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-xl h-11 px-8">
                Update Branch
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Branch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedBranch?.name}
              &quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBranch}
              className="bg-destructive hover:bg-destructive/90 rounded-xl"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
