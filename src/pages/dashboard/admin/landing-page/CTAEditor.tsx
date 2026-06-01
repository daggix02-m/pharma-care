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
import { Save } from "lucide-react";
import { SectionEditorProps } from "./SectionEditorProps";

export function CTAEditor({ content, onSave, saving }: SectionEditorProps) {
  const [ctaTitle, setCtaTitle] = useState(content.ctaTitle || "");
  const [ctaDescription, setCtaDescription] = useState(
    content.ctaDescription || "",
  );
  const [ctaPrimaryButton, setCtaPrimaryButton] = useState(
    content.ctaPrimaryButton || "",
  );
  const [ctaSecondaryButton, setCtaSecondaryButton] = useState(
    content.ctaSecondaryButton || "",
  );

  const handleSave = () => {
    onSave({
      ctaTitle,
      ctaDescription,
      ctaPrimaryButton,
      ctaSecondaryButton,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Call-to-Action Section</CardTitle>
        <CardDescription>Edit the CTA section content</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="ctaTitle">Title</Label>
          <Input
            id="ctaTitle"
            value={ctaTitle}
            onChange={(e) => setCtaTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ctaDescription">Description</Label>
          <Textarea
            id="ctaDescription"
            value={ctaDescription}
            onChange={(e) => setCtaDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ctaPrimaryButton">Primary Button</Label>
            <Input
              id="ctaPrimaryButton"
              value={ctaPrimaryButton}
              onChange={(e) => setCtaPrimaryButton(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ctaSecondaryButton">Secondary Button</Label>
            <Input
              id="ctaSecondaryButton"
              value={ctaSecondaryButton}
              onChange={(e) => setCtaSecondaryButton(e.target.value)}
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  );
}
