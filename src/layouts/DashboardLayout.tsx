import * as React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { TopBar } from "@/components/dashboard/TopBar";
import gsap from "gsap";

// Page transition wrapper with GSAP
const PageTransition = React.memo(function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="contents">
      {children}
    </div>
  );
});

// Dashboard layout component
export const DashboardLayout = React.memo(function DashboardLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const location = useLocation();

  // Reset scroll on route change
  React.useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname, location.search]);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden">
      {/* Top Navigation Bar */}
      <TopBar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pt-16">
        <div className="w-full max-w-full min-w-0 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-x-hidden">
          {/* Page Content with Transition */}
          <PageTransition>
            <div className="min-h-[calc(100vh-200px)] max-w-full min-w-0 overflow-x-hidden">
              {children || <Outlet />}
            </div>
          </PageTransition>
        </div>
      </main>

      {/* Subtle Background Elements - Minimalist style */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Top right gradient blob */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/[0.02] rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3" />
        {/* Bottom left gradient blob */}
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/[0.02] rounded-full blur-[150px] translate-y-1/2 -translate-x-1/3" />
      </div>

      {/* Bottom border accent */}
      <div className="fixed bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50 pointer-events-none" />

      {/* FRM branding watermark */}
      <a
        href="https://frm.et"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-3 right-4 z-40 flex items-center gap-2 opacity-40 hover:opacity-80 transition-opacity pointer-events-auto"
      >
        <span className="text-xs font-display font-semibold text-muted-foreground">
          Built by
        </span>
        <img
          src="/frm-logo.png"
          alt="FRM"
          className="h-10 w-auto object-contain block dark:hidden"
        />
        <img
          src="/frm-logo-light.png"
          alt="FRM"
          className="h-10 w-auto object-contain hidden dark:block"
        />
      </a>
    </div>
  );
});

export default DashboardLayout;
