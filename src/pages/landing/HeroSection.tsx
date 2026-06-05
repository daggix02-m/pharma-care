import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { BackgroundPaths } from "@/components/shared/BackgroundPaths";
import { Skeleton } from "@/components/ui/skeleton";

function HeroSection() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);

  const content = useQuery(api.public.landingPage.getLandingPageSection, {
    sectionKey: "hero",
  }) as any;

  useEffect(() => {
    if (sectionRef.current) {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: "power2.out" },
      );
    }
  }, []);

  const title = content?.heroTitle || "Transform Your Pharmacy Management";
  const description =
    content?.heroDescription ||
    "Join hundreds of pharmacies across Ethiopia using PharmaCare to manage multi-branch operations, inventory, prescriptions, and staff - all in one powerful platform.";

  if (content === undefined) {
    return (
      <section className="relative min-h-screen w-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-16 w-full max-w-sm sm:w-96 mx-auto" />
          <Skeleton className="h-8 w-full max-w-xs sm:w-64 mx-auto" />
          <Skeleton className="h-12 w-32 mx-auto" />
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative min-h-screen w-full">
      <BackgroundPaths
        title={title}
        description={description}
        onActionClick={() => navigate("/auth/signup")}
      />
    </section>
  );
}

export default HeroSection;
