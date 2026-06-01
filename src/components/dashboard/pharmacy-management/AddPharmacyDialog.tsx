"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
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
import type { PharmacyFormData } from "./types";

interface AddPharmacyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PharmacyFormData) => void;
}

export function AddPharmacyDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddPharmacyDialogProps) {
  const [formData, setFormData] = useState<PharmacyFormData>({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    if (!open) {
      setFormData({ name: "", address: "", phone: "", email: "" });
    }
  }, [open]);

  const handleSubmit = () => {
    onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Pharmacy</DialogTitle>
          <DialogDescription>
            Enter the details for the new pharmacy. This action is not available
            for admin role.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="pharmacy-name">Pharmacy Name</Label>
            <Input
              id="pharmacy-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter pharmacy name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pharmacy-address">Address</Label>
            <Textarea
              id="pharmacy-address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="Enter pharmacy address"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pharmacy-phone">Phone</Label>
            <Input
              id="pharmacy-phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="Enter phone number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pharmacy-email">Email</Label>
            <Input
              id="pharmacy-email"
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
            <Plus className="h-4 w-4 mr-2" />
            Add Pharmacy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
