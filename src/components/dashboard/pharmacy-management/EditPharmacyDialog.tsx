"use client";

import { useState, useEffect } from "react";
import { Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Pharmacy, PharmacyFormData } from "./types";

interface EditPharmacyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pharmacy: Pharmacy | null;
  onSubmit: (data: PharmacyFormData & { id: string }) => void;
}

export function EditPharmacyDialog({
  open,
  onOpenChange,
  pharmacy,
  onSubmit,
}: EditPharmacyDialogProps) {
  const [formData, setFormData] = useState<PharmacyFormData>({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    if (open && pharmacy) {
      setFormData({
        name: pharmacy.name,
        address: pharmacy.address,
        phone: pharmacy.phone,
        email: pharmacy.email,
      });
    }
  }, [open, pharmacy]);

  const handleSubmit = () => {
    if (pharmacy) {
      onSubmit({ id: pharmacy.id, ...formData });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Pharmacy</DialogTitle>
          <DialogDescription>
            Update the pharmacy details. This action is not available for admin
            role.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-pharmacy-name">Pharmacy Name</Label>
            <Input
              id="edit-pharmacy-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter pharmacy name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-pharmacy-address">Address</Label>
            <Textarea
              id="edit-pharmacy-address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="Enter pharmacy address"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-pharmacy-phone">Phone</Label>
            <Input
              id="edit-pharmacy-phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="Enter phone number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-pharmacy-email">Email</Label>
            <Input
              id="edit-pharmacy-email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Enter email address"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Edit className="h-4 w-4 mr-2" />
            Update Pharmacy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
