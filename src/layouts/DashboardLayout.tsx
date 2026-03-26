import * as React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { TopBar } from '@/components/dashboard/TopBar';
import Breadcrumb from '@/components/shared/Breadcrumb';
import { cn } from '@/lib/utils';
import gsap from 'gsap';

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
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className='contents'>
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, location.search]);

  return (
    <div className='min-h-screen bg-background flex flex-col'>
      {/* Top Navigation Bar */}
      <TopBar />

      {/* Main Content Area */}
      <main className='flex-1 overflow-auto'>
        <div className='w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
          {/* Breadcrumb Navigation */}
          <div
            className={cn('mb-6', 'opacity-70 hover:opacity-100 transition-opacity duration-200')}
          >
            <Breadcrumb />
          </div>

          {/* Page Content with Transition */}
          <PageTransition>
            <div className='min-h-[calc(100vh-200px)]'>{children || <Outlet />}</div>
          </PageTransition>
        </div>
      </main>

      {/* Subtle Background Elements - Minimalist style */}
      <div className='fixed inset-0 -z-10 overflow-hidden pointer-events-none'>
        {/* Top right gradient blob */}
        <div className='absolute top-0 right-0 w-[600px] h-[600px] bg-primary/[0.02] rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3' />
        {/* Bottom left gradient blob */}
        <div className='absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/[0.02] rounded-full blur-[150px] translate-y-1/2 -translate-x-1/3' />
      </div>

      {/* Bottom border accent */}
      <div className='fixed bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50 pointer-events-none' />
    </div>
  );
});

export default DashboardLayout;
