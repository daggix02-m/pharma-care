import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Layout,
  MessageSquare,
  Eye,
  Check,
  Star,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { ContentEditor } from "./ContentEditor";
import { TestimonialsManager } from "./TestimonialsManager";
import { SectionVisibility } from "./SectionVisibility";
import { useAuth } from "@/contexts/AuthContext";

interface LandingPageSection {
  _id: string;
  sectionId: string;
  name: string;
  displayName: string;
  description?: string;
  isEnabled: boolean;
  displayOrder: number;
  analyticsEnabled: boolean;
}

interface LandingPageContentVersion {
  version?: number;
}

export function LandingPageManagement() {
  const { sessionToken } = useAuth();
  const [activeTab, setActiveTab] = useState("content");
  const landingPageContent = useQuery(
    api.admin.landingPage.getLandingPageContentAdmin,
    sessionToken ? { sessionToken } : "skip",
  );
  const testimonialStats = useQuery(
    api.admin.testimonials.getTestimonialStats,
    sessionToken ? { sessionToken } : "skip",
  );
  const initializeContent = useMutation(
    api.admin.landingPage.initializeLandingPageContent,
  );

  const handleInitialize = async () => {
    try {
      await initializeContent({ sessionToken: sessionToken || undefined });
      toast.success("Landing page content initialized successfully");
    } catch (error) {
      toast.error("Failed to initialize content");
    }
  };

  if (landingPageContent === undefined || testimonialStats === undefined) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const sections: LandingPageSection[] =
    (landingPageContent?.sections as LandingPageSection[]) || [];
  const content: LandingPageContentVersion[] =
    landingPageContent?.content || [];

  // Check if content exists
  const hasContent = content.length > 0;
  const activeSectionsCount = sections.filter(
    (s: LandingPageSection) => s.isEnabled,
  ).length;
  const pendingTestimonials = testimonialStats?.pending || 0;
  const approvedTestimonials = testimonialStats?.approved || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold tracking-tight text-foreground">
            Landing Page Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage content, testimonials, and analytics for the public landing
            page
          </p>
        </div>
        {!hasContent && (
          <Button onClick={handleInitialize} className="gap-2">
            <Check className="h-4 w-4" />
            Initialize Content
          </Button>
        )}
      </div>

      <Card className="border border-border/60 bg-gradient-to-r from-primary/[0.06] via-background to-emerald-500/[0.06]">
        <CardContent className="p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Experience Ops
              </p>
              <h3 className="text-lg font-semibold mt-1">
                Manage content, testimonials, and visibility in one flow.
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={activeTab === "content" ? "default" : "outline"}
                onClick={() => setActiveTab("content")}
              >
                Edit Content
              </Button>
              <Button
                size="sm"
                variant={activeTab === "testimonials" ? "default" : "outline"}
                onClick={() => setActiveTab("testimonials")}
                className="gap-1.5"
              >
                Review Testimonials
                {pendingTestimonials > 0 && (
                  <Badge
                    variant="destructive"
                    className="h-5 px-1.5 text-[10px]"
                  >
                    {pendingTestimonials}
                  </Badge>
                )}
              </Button>
              <Button
                size="sm"
                variant={activeTab === "sections" ? "default" : "outline"}
                onClick={() => setActiveTab("sections")}
              >
                Toggle Sections
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card
          className="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
          onClick={() => setActiveTab("sections")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Active Sections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeSectionsCount} / {sections.length}
            </div>
            <p className="text-xs text-primary mt-2 inline-flex items-center gap-1">
              Manage visibility
              <ArrowRight className="h-3.5 w-3.5" />
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
          onClick={() => setActiveTab("testimonials")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Total Testimonials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {testimonialStats?.total || 0}
            </div>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {pendingTestimonials} Pending
              </Badge>
              <Badge variant="default" className="text-xs">
                {approvedTestimonials} Approved
              </Badge>
            </div>
            <p className="text-xs text-primary mt-2 inline-flex items-center gap-1">
              Review submissions
              <ArrowRight className="h-3.5 w-3.5" />
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
          onClick={() => setActiveTab("testimonials")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Star className="h-4 w-4" />
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {testimonialStats?.avgRating?.toFixed(1) || "0.0"}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                / 5.0
              </span>
            </div>
            <p className="text-xs text-primary mt-2 inline-flex items-center gap-1">
              Quality overview
              <ArrowRight className="h-3.5 w-3.5" />
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
          onClick={() => setActiveTab("content")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Content Versions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {content.reduce(
                (sum: number, c: LandingPageContentVersion) =>
                  sum + (c.version || 1),
                0,
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total edits made
            </p>
            <p className="text-xs text-primary mt-2 inline-flex items-center gap-1">
              Continue editing
              <ArrowRight className="h-3.5 w-3.5" />
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 lg:w-full">
          <TabsTrigger value="content" className="gap-2">
            <Layout className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Testimonials
            {testimonialStats?.pending > 0 && (
              <Badge
                variant="destructive"
                className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]"
              >
                {testimonialStats.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sections" className="gap-2">
            <Eye className="h-4 w-4" />
            Sections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-6">
          {hasContent ? (
            <ContentEditor content={content} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Sparkles className="h-12 w-12 text-primary/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Content Found</h3>
                <p className="text-muted-foreground text-center max-w-md mb-4">
                  Initialize the landing page with default content to get
                  started with content management.
                </p>
                <Button onClick={handleInitialize}>
                  Initialize Default Content
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="testimonials" className="mt-6">
          <TestimonialsManager />
        </TabsContent>

        <TabsContent value="sections" className="mt-6">
          <SectionVisibility sections={sections as any} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default LandingPageManagement;
