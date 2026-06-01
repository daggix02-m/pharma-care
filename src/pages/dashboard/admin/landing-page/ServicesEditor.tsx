import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Package, Save } from "lucide-react";
import { SectionEditorProps } from "./SectionEditorProps";

const DEFAULT_SERVICES = [
  {
    id: "inventory",
    icon: "Package",
    title: "Multi-Branch Inventory",
    description:
      "Real-time stock tracking across all branches with automated low-stock alerts, expiry management, and batch tracking.",
    features: [
      "Stock alerts",
      "Expiry tracking",
      "Batch management",
      "Cross-branch transfers",
    ],
  },
  {
    id: "prescriptions",
    icon: "FileText",
    title: "Prescription Management",
    description:
      "Digital prescription tracking with patient history, refill management, and automated validation checks.",
    features: [
      "Digital prescriptions",
      "Patient history",
      "Refill alerts",
      "Drug interaction checks",
    ],
  },
  {
    id: "sales",
    icon: "ShoppingCart",
    title: "Sales & Billing",
    description:
      "Complete point of sale system with multiple payment methods, receipt generation, and detailed sales analytics.",
    features: [
      "POS system",
      "Multiple payments",
      "Receipt generation",
      "Sales reports",
    ],
  },
  {
    id: "staff",
    icon: "Users",
    title: "Staff Management",
    description:
      "Role-based access control for managers, pharmacists, and cashiers with comprehensive audit logs.",
    features: [
      "Role permissions",
      "Activity logs",
      "Performance tracking",
      "Shift management",
    ],
  },
  {
    id: "analytics",
    icon: "BarChart3",
    title: "AI-Powered Analytics",
    description:
      "Sales forecasting, inventory optimization, and performance insights with automated reporting.",
    features: [
      "Sales forecasting",
      "Stock optimization",
      "Performance metrics",
      "Auto reports",
    ],
  },
  {
    id: "patients",
    icon: "UserCircle",
    title: "Patient Records",
    description:
      "Comprehensive patient profiles with medication history, allergy tracking, and prescription management.",
    features: [
      "Patient profiles",
      "Med history",
      "Allergy alerts",
      "Prescription tracking",
    ],
  },
];

export function ServicesEditor({
  content,
  onSave,
  saving,
}: SectionEditorProps) {
  const [servicesTitle, setServicesTitle] = useState(
    content.servicesTitle || "",
  );
  const [servicesSubtitle, setServicesSubtitle] = useState(
    content.servicesSubtitle || "",
  );
  const [services, setServices] = useState(
    content.services || DEFAULT_SERVICES,
  );

  const handleSave = () => {
    onSave({
      servicesTitle,
      servicesSubtitle,
      services,
    });
  };

  const updateService = (index: number, field: string, value: string) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Services Section
        </CardTitle>
        <CardDescription>
          Edit the 6 service cards displayed on the landing page
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="servicesTitle">Section Title</Label>
          <Input
            id="servicesTitle"
            value={servicesTitle}
            onChange={(e) => setServicesTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="servicesSubtitle">Section Subtitle</Label>
          <Input
            id="servicesSubtitle"
            value={servicesSubtitle}
            onChange={(e) => setServicesSubtitle(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          {services.map((service: any, index: number) => (
            <div key={service.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{service.title}</span>
                  <Badge variant="secondary" className="text-xs">
                    {service.icon}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={service.title}
                  onChange={(e) =>
                    updateService(index, "title", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={service.description}
                  onChange={(e) =>
                    updateService(index, "description", e.target.value)
                  }
                  rows={3}
                />
              </div>
            </div>
          ))}
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  );
}
