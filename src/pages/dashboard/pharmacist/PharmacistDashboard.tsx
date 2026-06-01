import { useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import gsap from "gsap";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { PharmacistTab } from "./sections/types";
import { OverviewSection } from "./sections/OverviewSection";
import { MedicinesSection } from "./sections/MedicinesSection";
import { ExpiryAlertsSection } from "./sections/ExpiryAlertsSection";
import { StockRequestsSection } from "./sections/StockRequestsSection";
import { ReportsSection } from "./sections/ReportsSection";

export function PharmacistDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const validTabs: PharmacistTab[] = [
    "overview",
    "medicines",
    "expiry",
    "stock",
    "reports",
  ];
  const activeTab: PharmacistTab =
    requestedTab && validTabs.includes(requestedTab as PharmacistTab)
      ? (requestedTab as PharmacistTab)
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
          Pharmacist Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor branch inventory and medical supplies
        </p>
      </div>

      <Tabs value={activeTab} className="w-full">
        <div ref={contentRef}>
          <TabsContent value="overview" className="mt-0 focus:outline-none">
            <OverviewSection
              onNavigateTab={(tab) => navigate(`/pharmacist?tab=${tab}`)}
            />
          </TabsContent>

          <TabsContent value="medicines" className="mt-0 focus:outline-none">
            <MedicinesSection />
          </TabsContent>

          <TabsContent value="expiry" className="mt-0 focus:outline-none">
            <ExpiryAlertsSection />
          </TabsContent>

          <TabsContent value="stock" className="mt-0 focus:outline-none">
            <StockRequestsSection />
          </TabsContent>

          <TabsContent value="reports" className="mt-0 focus:outline-none">
            <ReportsSection />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
