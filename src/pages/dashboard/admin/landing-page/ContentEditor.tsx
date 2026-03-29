import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Package, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface ContentEditorProps {
  content: any[];
}

export function ContentEditor({ content }: ContentEditorProps) {
  const { sessionToken } = useAuth();
  const updateHero = useMutation(api.admin.landingPage.updateHeroSection);
  const updateServices = useMutation(
    api.admin.landingPage.updateServicesSection,
  );
  const updateFeatures = useMutation(
    api.admin.landingPage.updateFeaturesSection,
  );
  const updateCTA = useMutation(api.admin.landingPage.updateCTASection);
  const updateAbout = useMutation(api.admin.landingPage.updateAboutSection);
  const updateTestimonials = useMutation(
    api.admin.landingPage.updateTestimonialsSection,
  );

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("hero");

  // Find content by section key
  const getSectionContent = (key: string) => {
    const section = content.find((c) => c.sectionKey === key);
    return section?.content || {};
  };

  const handleSave = async (sectionKey: string, data: any) => {
    setSaving(true);
    try {
      switch (sectionKey) {
        case "hero":
          await updateHero({
            ...data,
            sessionToken: sessionToken || undefined,
          });
          break;
        case "services":
          await updateServices({
            ...data,
            sessionToken: sessionToken || undefined,
          });
          break;
        case "features":
          await updateFeatures({
            ...data,
            sessionToken: sessionToken || undefined,
          });
          break;
        case "cta":
          await updateCTA({ ...data, sessionToken: sessionToken || undefined });
          break;
        case "about":
          await updateAbout({
            ...data,
            sessionToken: sessionToken || undefined,
          });
          break;
        case "testimonials":
          await updateTestimonials({
            ...data,
            sessionToken: sessionToken || undefined,
          });
          break;
      }
      toast.success(`${sectionKey} section updated successfully`);
    } catch (error) {
      toast.error(`Failed to update ${sectionKey} section`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto">
        <TabsTrigger value="hero">Hero</TabsTrigger>
        <TabsTrigger value="services">Services</TabsTrigger>
        <TabsTrigger value="features">Features</TabsTrigger>
        <TabsTrigger value="cta">CTA</TabsTrigger>
        <TabsTrigger value="about">About</TabsTrigger>
        <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
      </TabsList>

      <TabsContent value="hero" className="mt-6">
        <HeroEditor
          content={getSectionContent("hero")}
          onSave={(data) => handleSave("hero", data)}
          saving={saving}
        />
      </TabsContent>

      <TabsContent value="services" className="mt-6">
        <ServicesEditor
          content={getSectionContent("services")}
          onSave={(data) => handleSave("services", data)}
          saving={saving}
        />
      </TabsContent>

      <TabsContent value="features" className="mt-6">
        <FeaturesEditor
          content={getSectionContent("features")}
          onSave={(data) => handleSave("features", data)}
          saving={saving}
        />
      </TabsContent>

      <TabsContent value="cta" className="mt-6">
        <CTAEditor
          content={getSectionContent("cta")}
          onSave={(data) => handleSave("cta", data)}
          saving={saving}
        />
      </TabsContent>

      <TabsContent value="about" className="mt-6">
        <AboutEditor
          content={getSectionContent("about")}
          onSave={(data) => handleSave("about", data)}
          saving={saving}
        />
      </TabsContent>

      <TabsContent value="testimonials" className="mt-6">
        <TestimonialsEditor
          content={getSectionContent("testimonials")}
          onSave={(data) => handleSave("testimonials", data)}
          saving={saving}
        />
      </TabsContent>
    </Tabs>
  );
}

// Hero Editor
function HeroEditor({
  content,
  onSave,
  saving,
}: {
  content: any;
  onSave: (data: any) => void;
  saving: boolean;
}) {
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

// Services Editor
function ServicesEditor({
  content,
  onSave,
  saving,
}: {
  content: any;
  onSave: (data: any) => void;
  saving: boolean;
}) {
  const [servicesTitle, setServicesTitle] = useState(
    content.servicesTitle || "",
  );
  const [servicesSubtitle, setServicesSubtitle] = useState(
    content.servicesSubtitle || "",
  );
  const [services, setServices] = useState(
    content.services || [
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
    ],
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

// Features Editor
function FeaturesEditor({
  content,
  onSave,
  saving,
}: {
  content: any;
  onSave: (data: any) => void;
  saving: boolean;
}) {
  const [featuresTitle, setFeaturesTitle] = useState(
    content.featuresTitle || "",
  );
  const [featuresSubtitle, setFeaturesSubtitle] = useState(
    content.featuresSubtitle || "",
  );
  const [features] = useState(
    content.features || [
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
    ],
  );

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

// CTA Editor
function CTAEditor({
  content,
  onSave,
  saving,
}: {
  content: any;
  onSave: (data: any) => void;
  saving: boolean;
}) {
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

// About Editor
function AboutEditor({
  content,
  onSave,
  saving,
}: {
  content: any;
  onSave: (data: any) => void;
  saving: boolean;
}) {
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

// Testimonials Editor
function TestimonialsEditor({
  content,
  onSave,
  saving,
}: {
  content: any;
  onSave: (data: any) => void;
  saving: boolean;
}) {
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

export default ContentEditor;
