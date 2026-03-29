import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Target,
  Eye as EyeIcon,
  Heart,
  Shield,
  Users,
  TrendingUp,
  Award,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { LabBackground } from "@/components/shared/LabBackground";

const coreValues = [
  {
    icon: Target,
    title: "Innovation",
    description:
      "We constantly push boundaries to deliver cutting-edge solutions that transform pharmacy operations.",
  },
  {
    icon: Shield,
    title: "Security",
    description:
      "Bank-level encryption and compliance standards ensure your data is always protected.",
  },
  {
    icon: Award,
    title: "Reliability",
    description:
      "99.9% uptime guarantee with robust infrastructure built for mission-critical operations.",
  },
  {
    icon: Heart,
    title: "Customer Success",
    description:
      "Your success is our success. We are committed to helping pharmacies thrive.",
  },
  {
    icon: Users,
    title: "Compliance",
    description:
      "Built with regulatory requirements in mind to ensure adherence to healthcare standards.",
  },
  {
    icon: TrendingUp,
    title: "Accessibility",
    description:
      "Making advanced pharmacy management accessible to pharmacies of all sizes across Ethiopia.",
  },
];

function AboutPage() {
  const navigate = useNavigate();
  const headerRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const aboutContent = useQuery(api.public.landingPage.getLandingPageSection, {
    sectionKey: "about",
  });
  const analytics = useQuery(api.public.landingPage.getAboutPageContent);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          immediateRender: true,
        },
      );

      // Story section
      gsap.fromTo(
        storyRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: storyRef.current,
            start: "top 80%",
            once: true,
          },
          immediateRender: true,
        },
      );

      // Mission/Vision section
      gsap.fromTo(
        missionRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: missionRef.current,
            start: "top 80%",
            once: true,
          },
          immediateRender: true,
        },
      );

      // Values section
      gsap.fromTo(
        valuesRef.current?.children || [],
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: valuesRef.current,
            start: "top 80%",
            once: true,
          },
          immediateRender: true,
        },
      );

      // Stats section
      gsap.fromTo(
        statsRef.current?.children || [],
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: statsRef.current,
            start: "top 80%",
            once: true,
          },
          immediateRender: true,
        },
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      <LabBackground className="fixed inset-0 z-0 opacity-30" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-border">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-foreground hover:bg-secondary rounded-xl font-bold"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div
              ref={headerRef}
              className="flex flex-col items-center justify-center space-y-4 text-center"
            >
              <Badge className="bg-muted text-muted-foreground border-border font-display uppercase tracking-widest text-[10px]">
                About Us
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl text-foreground font-display max-w-4xl">
                Transforming Pharmacy Management Across Ethiopia
              </h1>
              <p className="mx-auto max-w-[900px] text-muted-foreground md:text-xl font-body leading-relaxed">
                We are on a mission to empower pharmacies with cutting-edge
                technology that simplifies operations and enhances patient care.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        {((aboutContent?.aboutStats?.length ?? 0) > 0 ||
          !aboutContent?.aboutStats) && (
          <section className="w-full py-12 bg-muted/30">
            <div className="container px-4 md:px-6">
              <div
                ref={statsRef}
                className="grid grid-cols-2 md:grid-cols-4 gap-6"
              >
                {(
                  aboutContent?.aboutStats || [
                    {
                      label: "Pharmacies",
                      value: "150+",
                      description: "Trust PharmaCare daily",
                    },
                    {
                      label: "Prescriptions",
                      value: "500K+",
                      description: "Processed monthly",
                    },
                    {
                      label: "Uptime",
                      value: "99.9%",
                      description: "Guaranteed reliability",
                    },
                    {
                      label: "Support",
                      value: "24/7",
                      description: "Customer service",
                    },
                  ]
                ).map((stat, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-border shadow-sm"
                  >
                    <span className="text-4xl md:text-5xl font-bold text-primary font-display">
                      {stat.value}
                    </span>
                    <span className="text-sm font-medium text-foreground mt-2">
                      {stat.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {stat.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Our Story Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div
              ref={storyRef}
              className="grid gap-12 lg:grid-cols-2 items-center"
            >
              <div className="space-y-6">
                <Badge className="bg-primary/10 text-primary border-none font-display uppercase tracking-widest text-[10px]">
                  Our Story
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground font-display">
                  From a Single Pharmacy to a National Platform
                </h2>
                <p className="text-muted-foreground md:text-lg font-body leading-relaxed">
                  {aboutContent?.aboutStory ||
                    "PharmaCare was born from a simple observation: pharmacies in Ethiopia needed better tools to manage their growing operations. What started as a solution for a single pharmacy has grown into a comprehensive platform serving hundreds of pharmacies across the country."}
                </p>
                <p className="text-muted-foreground md:text-lg font-body leading-relaxed">
                  We have seen firsthand the challenges pharmacy owners face -
                  from managing multi-branch operations to keeping track of
                  inventory and ensuring compliance with regulations. Our
                  platform was built by pharmacy owners, for pharmacy owners.
                </p>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-muted overflow-hidden flex items-center justify-center border border-border">
                  <div className="text-center p-8">
                    <Sparkles className="h-24 w-24 text-primary/40 mx-auto mb-6" />
                    <p className="text-2xl font-bold text-foreground font-display">
                      Built for Pharmacy Owners
                    </p>
                    <p className="text-muted-foreground mt-2">
                      By Pharmacy Owners
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div ref={missionRef} className="grid gap-12 lg:grid-cols-2">
              {/* Mission */}
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-border p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground font-display">
                    Our Mission
                  </h3>
                </div>
                <p className="text-muted-foreground md:text-lg font-body leading-relaxed">
                  {aboutContent?.aboutMission ||
                    "To empower pharmacies across Ethiopia with cutting-edge technology that simplifies operations, enhances patient care, and drives business growth."}
                </p>
              </div>

              {/* Vision */}
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-border p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <EyeIcon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground font-display">
                    Our Vision
                  </h3>
                </div>
                <p className="text-muted-foreground md:text-lg font-body leading-relaxed">
                  {aboutContent?.aboutVision ||
                    "To become the leading pharmacy management platform in Africa, setting new standards for efficiency, compliance, and patient safety in healthcare."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <Badge className="bg-muted text-muted-foreground border-border font-display uppercase tracking-widest text-[10px]">
                Core Values
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground font-display mt-4">
                What We Stand For
              </h2>
            </div>

            <div
              ref={valuesRef}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {(
                aboutContent?.aboutValues || coreValues.map((v) => v.title)
              ).map((value, index) => {
                const valueData =
                  typeof value === "string"
                    ? coreValues.find((v) => v.title === value) ||
                      coreValues[index]
                    : coreValues[index];
                const Icon = valueData.icon;

                return (
                  <div
                    key={index}
                    className="group bg-white/50 backdrop-blur-sm rounded-2xl border border-border p-6 hover:bg-white/80 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground font-display mb-2">
                          {typeof value === "string" ? value : valueData.title}
                        </h3>
                        <p className="text-sm text-muted-foreground font-body leading-relaxed">
                          {valueData.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground font-display mb-4">
                Ready to Modernize Your Pharmacy?
              </h2>
              <p className="text-muted-foreground md:text-lg font-body mb-8">
                Contact us for pricing and a personalized demo. Join pharmacies
                across Ethiopia using PharmaCare to streamline operations and
                improve patient care.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-8 font-bold"
                  onClick={() => navigate("/contact")}
                >
                  Contact Us
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-xl px-8 font-bold"
                  onClick={() => navigate("/contact")}
                >
                  Schedule Demo
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AboutPage;
