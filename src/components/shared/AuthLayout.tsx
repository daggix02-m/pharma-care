import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { FloatingPaths } from "./FloatingPaths";
import { Logo } from "./Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { usePageTransition } from "@/hooks/useGsapAnimation";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const containerRef = usePageTransition();

  return (
    <main
      ref={containerRef}
      className="relative min-h-screen bg-background overflow-x-hidden lg:grid lg:grid-cols-2"
    >
      <div className="bg-muted/50 relative hidden h-full flex-col border-r border-border p-10 lg:flex">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-background to-transparent" />
        <div className="z-20 flex items-center justify-between">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <Logo
              iconClassName="h-24 w-24 rounded-2xl"
              textClassName="text-2xl"
            />
          </Link>
          <ThemeToggle className="bg-background/50 backdrop-blur-sm" />
        </div>
        <div className="z-20 mt-auto">
          <blockquote className="space-y-4">
            <p className="text-2xl font-display font-medium text-foreground leading-snug">
              &ldquo;This platform has revolutionized our inventory management,
              allowing us to serve patients faster and more safely than ever
              before.&rdquo;
            </p>
            <footer className="text-sm font-semibold text-muted-foreground uppercase tracking-widest font-body">
              — Dr. Sarah Chen, Head Pharmacist
            </footer>
          </blockquote>
        </div>
        <div className="absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </div>

      <div className="relative flex min-h-screen flex-col justify-center p-4 sm:p-8 lg:p-12">
        <div
          aria-hidden
          className="absolute inset-0 isolate contain-strict -z-10 opacity-40"
        >
          <div className="bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsl(var(--muted))_0,hsla(0,0%,55%,.02)_50%,transparent_80%)] absolute top-0 right-0 h-[800px] w-[350px] -translate-y-1/2 rounded-full" />
          <div className="bg-[radial-gradient(50%_50%_at_50%_50%,hsl(var(--accent))_0,transparent_100%)] absolute top-0 right-0 h-[800px] w-[150px] [translate:5%_-50%] rounded-full" />
        </div>

        {/* Mobile Header with Theme Toggle */}
        <div className="absolute top-8 left-6 right-6 lg:hidden z-20 flex items-center justify-between">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <Logo
              iconClassName="h-16 w-16 rounded-xl"
              textClassName="text-xl"
            />
          </Link>
          <ThemeToggle className="bg-background/50 backdrop-blur-sm" />
        </div>

        <div className="relative mx-auto w-full max-w-sm md:max-w-md xl:max-w-lg">
          {children}
        </div>
      </div>
    </main>
  );
}
