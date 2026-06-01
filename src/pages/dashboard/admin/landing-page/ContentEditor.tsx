import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { HeroEditor } from "./HeroEditor";
import { ServicesEditor } from "./ServicesEditor";
import { FeaturesEditor } from "./FeaturesEditor";
import { CTAEditor } from "./CTAEditor";
import { AboutEditor } from "./AboutEditor";
import { TestimonialsEditor } from "./TestimonialsEditor";

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

  const getSectionContent = (key: string) => {
    const section = content.find((c) => c.sectionKey === key);
    return section?.content || {};
  };

  const handleSave = async (sectionKey: string, data: any) => {
    setSaving(true);
    try {
      const token = sessionToken || undefined;
      const payload = { ...data, sessionToken: token };
      switch (sectionKey) {
        case "hero":
          await updateHero(payload);
          break;
        case "services":
          await updateServices(payload);
          break;
        case "features":
          await updateFeatures(payload);
          break;
        case "cta":
          await updateCTA(payload);
          break;
        case "about":
          await updateAbout(payload);
          break;
        case "testimonials":
          await updateTestimonials(payload);
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
