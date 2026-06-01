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
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { SectionEditorProps } from "./SectionEditorProps";

const DEFAULT_FEATURES = [
  {
    id: "security",
    icon: "Shield",
    title: "Enterprise Security",
    description: "Bank-level encryption and comprehensive audit trails.",
  },
  {
    id: "cloud",
    icon: "Cloud",
    title: "Cloud-Based",
    description: "Access your pharmacy data from anywhere, anytime.",
  },
  {
    id: "mobile",
    icon: "Smartphone",
    title: "Mobile Ready",
    description: "Full responsive design for on-the-go management.",
  },
  {
    id: "ai",
    icon: "Brain",
    title: "AI Assistant",
    description: "Get intelligent insights and automated recommendations.",
  },
];

export function FeaturesEditor({
  content,
  onSave,
  saving,
}: SectionEditorProps) {
  const [featuresTitle, setFeaturesTitle] = useState(
    content.featuresTitle || "",
  );
  const [featuresSubtitle, setFeaturesSubtitle] = useState(
    content.featuresSubtitle || "",
  );
  const [features] = useState(content.features || DEFAULT_FEATURES);

  const handleSave = () => {
    onSave({
      featuresTitle,
      featuresSubtitle,
      features,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Features Section</CardTitle>
        <CardDescription>Edit the features section content</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="featuresTitle">Title</Label>
          <Input
            id="featuresTitle"
            value={featuresTitle}
            onChange={(e) => setFeaturesTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="featuresSubtitle">Subtitle</Label>
          <Input
            id="featuresSubtitle"
            value={featuresSubtitle}
            onChange={(e) => setFeaturesSubtitle(e.target.value)}
          />
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  );
}
