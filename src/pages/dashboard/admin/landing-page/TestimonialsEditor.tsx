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

export function TestimonialsEditor({
  content,
  onSave,
  saving,
}: SectionEditorProps) {
  const [testimonialsTitle, setTestimonialsTitle] = useState(
    content.testimonialsTitle || "",
  );
  const [testimonialsSubtitle, setTestimonialsSubtitle] = useState(
    content.testimonialsSubtitle || "",
  );
  const [testimonialsButtonText, setTestimonialsButtonText] = useState(
    content.testimonialsButtonText || "",
  );

  const handleSave = () => {
    onSave({
      testimonialsTitle,
      testimonialsSubtitle,
      testimonialsButtonText,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Testimonials Section</CardTitle>
        <CardDescription>Edit the testimonials section content</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="testimonialsTitle">Title</Label>
          <Input
            id="testimonialsTitle"
            value={testimonialsTitle}
            onChange={(e) => setTestimonialsTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="testimonialsSubtitle">Subtitle</Label>
          <Input
            id="testimonialsSubtitle"
            value={testimonialsSubtitle}
            onChange={(e) => setTestimonialsSubtitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="testimonialsButtonText">Button Text</Label>
          <Input
            id="testimonialsButtonText"
            value={testimonialsButtonText}
            onChange={(e) => setTestimonialsButtonText(e.target.value)}
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
