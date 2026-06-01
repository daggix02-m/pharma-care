import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { SectionEditorProps } from "./SectionEditorProps";

export function AboutEditor({ content, onSave, saving }: SectionEditorProps) {
  const [aboutMission, setAboutMission] = useState(content.aboutMission || "");
  const [aboutVision, setAboutVision] = useState(content.aboutVision || "");
  const [aboutStory, setAboutStory] = useState(content.aboutStory || "");

  const handleSave = () => {
    onSave({
      aboutMission,
      aboutVision,
      aboutStory,
      aboutValues: content.aboutValues || [],
      aboutStats: content.aboutStats || [],
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>About Section</CardTitle>
        <CardDescription>Edit the about page content</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="aboutMission">Mission</Label>
          <Textarea
            id="aboutMission"
            value={aboutMission}
            onChange={(e) => setAboutMission(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="aboutVision">Vision</Label>
          <Textarea
            id="aboutVision"
            value={aboutVision}
            onChange={(e) => setAboutVision(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="aboutStory">Our Story</Label>
          <Textarea
            id="aboutStory"
            value={aboutStory}
            onChange={(e) => setAboutStory(e.target.value)}
            rows={5}
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
