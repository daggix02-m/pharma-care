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
import { Save, Sparkles } from "lucide-react";
import { SectionEditorProps } from "./SectionEditorProps";

export function HeroEditor({ content, onSave, saving }: SectionEditorProps) {
  const [heroTitle, setHeroTitle] = useState(content.heroTitle || "");
  const [heroSubtitle, setHeroSubtitle] = useState(content.heroSubtitle || "");
  const [heroDescription, setHeroDescription] = useState(
    content.heroDescription || "",
  );
  const [heroCtaText, setHeroCtaText] = useState(content.heroCtaText || "");
  const [heroCtaSecondaryText, setHeroCtaSecondaryText] = useState(
    content.heroCtaSecondaryText || "",
  );

  const handleSave = () => {
    onSave({
      heroTitle,
      heroSubtitle,
      heroDescription,
      heroCtaText,
      heroCtaSecondaryText,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Hero Section
        </CardTitle>
        <CardDescription>Edit the main hero section content</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="heroTitle">Title</Label>
          <Input
            id="heroTitle"
            value={heroTitle}
            onChange={(e) => setHeroTitle(e.target.value)}
            placeholder="Transform Your Pharmacy Management"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="heroSubtitle">Subtitle</Label>
          <Input
            id="heroSubtitle"
            value={heroSubtitle}
            onChange={(e) => setHeroSubtitle(e.target.value)}
            placeholder="Streamline operations and boost efficiency"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="heroDescription">Description</Label>
          <Textarea
            id="heroDescription"
            value={heroDescription}
            onChange={(e) => setHeroDescription(e.target.value)}
            rows={3}
            placeholder="Join hundreds of pharmacies..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="heroCtaText">Primary CTA</Label>
            <Input
              id="heroCtaText"
              value={heroCtaText}
              onChange={(e) => setHeroCtaText(e.target.value)}
              placeholder="Get Started Free"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="heroCtaSecondaryText">Secondary CTA</Label>
            <Input
              id="heroCtaSecondaryText"
              value={heroCtaSecondaryText}
              onChange={(e) => setHeroCtaSecondaryText(e.target.value)}
              placeholder="Watch Demo"
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
