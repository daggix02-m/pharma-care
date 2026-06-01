import { useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import gsap from "gsap";
import type { ManagerTab } from "./sections/types";
import { OverviewSection } from "./sections/OverviewSection";
import { BranchesSection } from "./sections/BranchesSection";
import { StaffSection } from "./sections/StaffSection";
import { TransferRequestsSection } from "./sections/TransferRequestsSection";
import { AuditTrailSection } from "./sections/AuditTrailSection";
import { SettingsSection } from "./sections/SettingsSection";

const VALID_TABS: ManagerTab[] = [
  "overview",
  "branches",
  "staff",
  "transfers",
  "audit",
  "settings",
];

export function ManagerDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab: ManagerTab =
    requestedTab && VALID_TABS.includes(requestedTab as ManagerTab)
      ? (requestedTab as ManagerTab)
      : "overview";
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
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight text-foreground">
          Manager Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your pharmacy operations and staff
        </p>
      </div>

      <Tabs value={activeTab} className="w-full">
        <div ref={contentRef}>
          <TabsContent value="overview" className="mt-0 focus:outline-none">
            <OverviewSection
              onNavigateTab={(tab) => navigate(`/manager?tab=${tab}`)}
            />
          </TabsContent>

          <TabsContent value="branches" className="mt-0 focus:outline-none">
            <BranchesSection />
          </TabsContent>

          <TabsContent value="staff" className="mt-0 focus:outline-none">
            <StaffSection />
          </TabsContent>

          <TabsContent value="transfers" className="mt-0 focus:outline-none">
            <TransferRequestsSection />
          </TabsContent>

          <TabsContent value="audit" className="mt-0 focus:outline-none">
            <AuditTrailSection />
          </TabsContent>

          <TabsContent value="settings" className="mt-0 focus:outline-none">
            <SettingsSection />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
