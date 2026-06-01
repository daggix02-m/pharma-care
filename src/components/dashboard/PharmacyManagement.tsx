"use client";

import { useState } from "react";
import { Building2, Plus, Edit, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedWrapper } from "@/components/dashboard/pharmacy-management/AnimatedWrapper";
import { PharmacyListItem } from "@/components/dashboard/pharmacy-management/PharmacyListItem";
import { AddPharmacyDialog } from "@/components/dashboard/pharmacy-management/AddPharmacyDialog";
import { EditPharmacyDialog } from "@/components/dashboard/pharmacy-management/EditPharmacyDialog";
import { DeletePharmacyDialog } from "@/components/dashboard/pharmacy-management/DeletePharmacyDialog";
import type {
  Pharmacy,
  PharmacyFormData,
} from "@/components/dashboard/pharmacy-management/types";

interface PharmacyManagementProps {
  pharmacies?: Pharmacy[];
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  onAddPharmacy?: (data: PharmacyFormData) => void;
  onEditPharmacy?: (data: PharmacyFormData & { id: string }) => void;
  onDeletePharmacy?: (id: string) => void;
}

export function PharmacyManagement({
  pharmacies = [],
  loading = false,
  error = null,
  onRetry,
  onAddPharmacy,
  onEditPharmacy,
  onDeletePharmacy,
}: PharmacyManagementProps) {
  const [expandedPharmacies, setExpandedPharmacies] = useState(
    new Set<string>(),
  );
  const [showAddPharmacyDialog, setShowAddPharmacyDialog] = useState(false);
  const [showEditPharmacyDialog, setShowEditPharmacyDialog] = useState(false);
  const [showDeletePharmacyDialog, setShowDeletePharmacyDialog] =
    useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(
    null,
  );

  const togglePharmacy = (pharmacyId: string) => {
    setExpandedPharmacies((prev) => {
      const newSet = new Set(prev);
      newSet.has(pharmacyId)
        ? newSet.delete(pharmacyId)
        : newSet.add(pharmacyId);
      return newSet;
    });
  };

  const handleAddPharmacy = (data: PharmacyFormData) => {
    if (onAddPharmacy) {
      onAddPharmacy(data);
    } else {
      toast.error(
        "Adding pharmacies is not available for admin role. Please contact a manager.",
      );
    }
  };

  const handleEditPharmacy = (data: PharmacyFormData & { id: string }) => {
    if (onEditPharmacy) {
      onEditPharmacy(data);
    } else {
      toast.error(
        "Updating pharmacies is not available for admin role. Please contact a manager.",
      );
    }
  };

  const handleDeletePharmacy = (id: string) => {
    if (onDeletePharmacy) {
      onDeletePharmacy(id);
    } else {
      toast.error(
        "Deleting pharmacies is not available for admin role. Please contact a manager.",
      );
    }
  };

  const openEditPharmacyDialog = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setShowEditPharmacyDialog(true);
  };

  const openDeletePharmacyDialog = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setShowDeletePharmacyDialog(true);
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4">
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary/20 rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Loading pharmacies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4">
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold">Error Loading Pharmacies</h3>
          <p className="text-muted-foreground text-center max-w-md">
            {String(error)}
          </p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (pharmacies.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4">
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Pharmacies Found</h3>
          <p className="text-muted-foreground text-center max-w-md">
            There are no pharmacies configured in the system. Contact your
            administrator or add a pharmacy to get started.
          </p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
        <AnimatedWrapper>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Pharmacy Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage pharmacies and staff
              </p>
            </div>
            <Button onClick={() => setShowAddPharmacyDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Pharmacy
            </Button>
          </div>
        </AnimatedWrapper>

        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="space-y-4">
              {pharmacies.map((pharmacy, index) => (
                <AnimatedWrapper
                  key={pharmacy.id || `pharmacy-${index}`}
                  delay={index * 100}
                >
                  <PharmacyListItem
                    pharmacy={pharmacy}
                    isExpanded={expandedPharmacies.has(pharmacy.id)}
                    onToggle={() => togglePharmacy(pharmacy.id)}
                    onEdit={openEditPharmacyDialog}
                    onDelete={openDeletePharmacyDialog}
                  />
                </AnimatedWrapper>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <AddPharmacyDialog
        open={showAddPharmacyDialog}
        onOpenChange={setShowAddPharmacyDialog}
        onSubmit={handleAddPharmacy}
      />
      <EditPharmacyDialog
        open={showEditPharmacyDialog}
        onOpenChange={setShowEditPharmacyDialog}
        pharmacy={selectedPharmacy}
        onSubmit={handleEditPharmacy}
      />
      <DeletePharmacyDialog
        open={showDeletePharmacyDialog}
        onOpenChange={setShowDeletePharmacyDialog}
        pharmacy={selectedPharmacy}
        onConfirm={handleDeletePharmacy}
      />
    </>
  );
}

export default PharmacyManagement;
