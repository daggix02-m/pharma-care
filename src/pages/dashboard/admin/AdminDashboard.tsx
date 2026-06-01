import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { Megaphone, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AdminBroadcastDialog } from "@/components/shared/messaging/AdminBroadcastDialog";
import { DiagnosticViewModal } from "@/components/shared/DiagnosticViewModal";
import { LandingPageManagement } from "./landing-page/LandingPageManagement";
import type { AdminTab } from "./sections/types";
import { OverviewSection } from "./sections/OverviewSection";
import { ApprovalsSection } from "./sections/ApprovalsSection";
import { PharmaciesSection } from "./sections/PharmaciesSection";
import { FeedbacksSection } from "./sections/FeedbacksSection";
import { AuditLogsSection } from "./sections/AuditLogsSection";
import { SubscriptionsSection } from "./sections/SubscriptionsSection";
import { SettingsSection } from "./sections/SettingsSection";

export function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestedTab = searchParams.get("tab");
  const validTabs: AdminTab[] = [
    "overview",
    "approvals",
    "pharmacies",
    "subscriptions",
    "feedbacks",
    "audit-logs",
    "settings",
    "landing-page",
  ];
  const activeTab: AdminTab =
    requestedTab && validTabs.includes(requestedTab as AdminTab)
      ? (requestedTab as AdminTab)
      : "overview";
  const [broadcastDialogOpen, setBroadcastDialogOpen] = useState(false);
  const [diagnosticDialogOpen, setDiagnosticDialogOpen] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, y: 8 },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: "power2.out",
            immediateRender: true,
          },
        );
      }
    }, contentRef);
    return () => ctx.revert();
  }, [activeTab]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
            Platform Admin
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Global management and system configuration
          </p>
        </div>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-lg gap-2 text-[13px] w-full sm:w-auto justify-center"
            onClick={() => navigate("/admin?tab=settings")}
          >
            <Activity className="w-4 h-4 text-primary" />
            System Status
          </Button>
          <Button
            onClick={() => setDiagnosticDialogOpen(true)}
            size="sm"
            className="h-9 rounded-lg gap-2 text-[13px] w-full sm:w-auto justify-center bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
          >
            <Activity className="w-4 h-4" />
            Diagnostic Session
          </Button>
          <Button
            onClick={() => setBroadcastDialogOpen(true)}
            size="sm"
            className="h-9 rounded-lg gap-2 text-[13px] w-full sm:w-auto justify-center bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
          >
            <Megaphone className="w-4 h-4" />
            Broadcast
          </Button>
        </div>
      </div>

      <AdminBroadcastDialog
        open={broadcastDialogOpen}
        onOpenChange={setBroadcastDialogOpen}
      />
      <DiagnosticViewModal
        open={diagnosticDialogOpen}
        onOpenChange={setDiagnosticDialogOpen}
      />

      <Tabs value={activeTab} className="w-full">
        <div ref={contentRef} className="outline-none focus:outline-none">
          <TabsContent value="overview" className="mt-0 focus:outline-none">
            <OverviewSection />
          </TabsContent>
          <TabsContent value="approvals" className="mt-0 focus:outline-none">
            <ApprovalsSection />
          </TabsContent>
          <TabsContent value="pharmacies" className="mt-0 focus:outline-none">
            <PharmaciesSection />
          </TabsContent>
          <TabsContent
            value="subscriptions"
            className="mt-0 focus:outline-none"
          >
            <SubscriptionsSection />
          </TabsContent>
          <TabsContent value="feedbacks" className="mt-0 focus:outline-none">
            <FeedbacksSection />
          </TabsContent>
          <TabsContent value="audit-logs" className="mt-0 focus:outline-none">
            <AuditLogsSection />
          </TabsContent>
          <TabsContent value="settings" className="mt-0 focus:outline-none">
            <SettingsSection />
          </TabsContent>
          <TabsContent value="landing-page" className="mt-0 focus:outline-none">
            <LandingPageManagement />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
