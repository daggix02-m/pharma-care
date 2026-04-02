import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PhoneCall, MoveRight } from "lucide-react";

interface CTAContent {
  ctaTitle?: string;
  ctaDescription?: string;
  ctaPrimaryButton?: string;
  ctaSecondaryButton?: string;
}

function CTASection({ content }: { content?: CTAContent }) {
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const title =
    content?.ctaTitle || "Ready to Orchestrate Your Pharmacy Operations?";
  const description =
    content?.ctaDescription ||
    "Join thousands of pharmacies that trust PharmaCare to manage their operations with speed, security, and precision.";
  const primaryButton = content?.ctaPrimaryButton || "Contact Sales";
  const secondaryButton = content?.ctaSecondaryButton || "Get Started Now";

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.98 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            once: true,
          },
          immediateRender: true,
        },
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="w-full py-20 lg:py-40 bg-transparent">
      <div className="container mx-auto px-4 md:px-6">
        <div
          ref={containerRef}
          className="flex flex-col text-center bg-white/40 backdrop-blur-md rounded-3xl shadow-sm p-8 lg:p-20 gap-8 items-center border border-border"
        >
          <Badge className="bg-muted text-muted-foreground border-border font-display uppercase tracking-widest text-[10px]">
            Get Started
          </Badge>
          <div className="flex flex-col gap-4">
            <h3 className="text-3xl md:text-5xl tracking-tight max-w-2xl font-bold text-foreground font-display leading-tight">
              {title}
            </h3>
            <p className="text-lg leading-relaxed text-muted-foreground max-w-xl mx-auto font-body">
              {description}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button
              size="lg"
              className="gap-4 bg-white text-foreground border border-border hover:bg-muted h-12 px-8 rounded-xl font-bold tracking-wide"
              variant="outline"
              onClick={() => {
                const el = document.getElementById("contact");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {primaryButton} <PhoneCall className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              className="gap-4 bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 rounded-xl font-bold tracking-wide shadow-sm"
              onClick={() => navigate("/auth/signup")}
            >
              {secondaryButton} <MoveRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
