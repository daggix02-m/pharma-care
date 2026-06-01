import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import * as LucideIcons from "lucide-react";

// Map of Lucide icons
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield: LucideIcons.Shield,
  Cloud: LucideIcons.Cloud,
  Smartphone: LucideIcons.Smartphone,
  Brain: LucideIcons.Brain,
  Lock: LucideIcons.Lock,
  Zap: LucideIcons.Zap,
  Clock: LucideIcons.Clock,
  Users: LucideIcons.Users,
  BarChart3: LucideIcons.BarChart3,
  Server: LucideIcons.Server,
  MapPin: LucideIcons.MapPin,
  MessageSquare: LucideIcons.MessageSquare,
};

function FeaturesSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const content = useQuery(api.public.landingPage.getLandingPageSection, {
    sectionKey: "features",
  }) as any;

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (!headerRef.current) return;

      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top 80%",
            once: true,
          },
          immediateRender: true,
        },
      );

      const validCards = cardsRef.current.filter(Boolean);
      if (validCards.length === 0) return;

      gsap.fromTo(
        validCards,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: validCards[0],
            start: "top 80%",
            once: true,
          },
          immediateRender: true,
        },
      );
    }, headerRef);

    return () => ctx.revert();
  }, []);

  const handleCardHover = (index: number, isHovering: boolean) => {
    if (cardsRef.current[index]) {
      gsap.to(cardsRef.current[index], {
        y: isHovering ? -8 : 0,
        scale: isHovering ? 1.02 : 1,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  };

  // Default features if content is not loaded
  interface Feature {
    id: string;
    icon: string;
    title: string;
    description: string;
  }

  const defaultFeatures: Feature[] = [
    {
      id: "security",
      icon: "Shield",
      title: "Enterprise Security",
      description:
        "Bank-level encryption, role-based access control, and comprehensive audit trails.",
    },
    {
      id: "cloud",
      icon: "Cloud",
      title: "Cloud-Based",
      description:
        "Access your pharmacy data from anywhere, anytime. Automatic backups and 99.9% uptime.",
    },
    {
      id: "mobile",
      icon: "Smartphone",
      title: "Mobile Ready",
      description:
        "Full responsive design works perfectly on tablets and phones for on-the-go management.",
    },
    {
      id: "ai",
      icon: "Brain",
      title: "AI Assistant",
      description:
        "Get intelligent insights and automated recommendations to optimize your operations.",
    },
  ];

  const features: Feature[] = content?.features || defaultFeatures;
  const title =
    content?.featuresTitle || "Powerful Features for Modern Pharmacies";
  const subtitle =
    content?.featuresSubtitle ||
    "Built with the latest technology to ensure security, reliability, and ease of use.";

  if (content === undefined) {
    return (
      <section
        id="features"
        className="w-full py-12 md:py-24 lg:py-32 bg-transparent"
      >
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <Skeleton className="h-6 w-24 mx-auto mb-4" />
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-64 mx-auto" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="features"
      className="w-full py-12 md:py-24 lg:py-32 bg-transparent"
    >
      <div className="container px-4 md:px-6">
        <div
          ref={headerRef}
          className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
        >
          <Badge className="bg-muted text-muted-foreground border-border font-display uppercase tracking-widest text-[10px]">
            Features
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-foreground font-display">
            {title}
          </h2>
          <p className="mx-auto max-w-[900px] text-muted-foreground md:text-xl font-body leading-relaxed">
            {subtitle}
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl items-center gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const IconComponent = iconMap[feature.icon] || LucideIcons.Circle;
            return (
              <div
                key={feature.id}
                ref={(el: HTMLDivElement | null) => {
                  cardsRef.current[index] = el;
                  return;
                }}
                className="group relative overflow-hidden rounded-2xl border border-border p-6 transition-all hover:bg-card/80 backdrop-blur-[2px] bg-card/40 cursor-pointer shadow-sm dark:bg-card/20 dark:hover:bg-card/40"
                onMouseEnter={() => handleCardHover(index, true)}
                onMouseLeave={() => handleCardHover(index, false)}
              >
                <div className="space-y-4">
                  <div className="mb-4 p-3 bg-primary/10 rounded-xl inline-block group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground font-display">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground font-body leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
