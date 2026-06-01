import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowLeft } from "lucide-react";

function ContactSuccess() {
  const containerRef = useRef<HTMLDivElement>(null);
  const checkmarkRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);

    // GSAP animations
    const ctx = gsap.context(() => {
      // Main container animation
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "power2.out" },
      );

      // Checkmark spring animation
      gsap.fromTo(
        checkmarkRef.current,
        { scale: 0 },
        { scale: 1, duration: 0.5, delay: 0.2, ease: "elastic.out(1, 0.5)" },
      );

      // Title animation
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.3, ease: "power2.out" },
      );

      // Subtitle animation
      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.4, ease: "power2.out" },
      );

      // Message animation
      gsap.fromTo(
        messageRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.5, ease: "power2.out" },
      );

      // Button animation
      gsap.fromTo(
        buttonRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5, delay: 0.6, ease: "power2.out" },
      );

      // Footer animation
      gsap.fromTo(
        footerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, delay: 0.8, ease: "power2.out" },
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/[0.03] rounded-full blur-[100px]" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/[0.03] rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-teal-500/[0.03] rounded-full blur-[80px]" />
      </div>

      <div ref={containerRef} className="text-center max-w-md mx-auto">
        {/* Animated checkmark */}
        <div
          ref={checkmarkRef}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>

        <h1
          ref={titleRef}
          className="text-4xl font-bold tracking-tight text-foreground font-display mb-4"
        >
          Thank You!
        </h1>

        <p
          ref={subtitleRef}
          className="text-xl text-muted-foreground mb-2 font-medium"
        >
          Your message has been received
        </p>

        <p
          ref={messageRef}
          className="text-muted-foreground mb-8 leading-relaxed"
        >
          Our team is reviewing your message and we'll get back to you as soon
          as possible.
        </p>

        <div ref={buttonRef}>
          <Link to="/">
            <Button
              size="lg"
              className="rounded-xl px-8 h-12 font-bold tracking-wide shadow-lg hover:shadow-xl transition-shadow"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          Expected response time: 24-48 hours
        </p>
      </div>

      {/* Decorative elements */}
      <div ref={footerRef} className="absolute bottom-6 text-center">
        <p className="text-base font-display font-semibold tracking-tight text-foreground">
          © {new Date().getFullYear()} PharmaCare Platform. All rights reserved.
        </p>
        <a
          href="https://frm.et"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 mt-4 opacity-80 hover:opacity-100 transition-opacity"
        >
          <span className="text-base font-display font-semibold tracking-tight text-foreground">
            Built by
          </span>
          <img
            src="/frm-logo.png"
            alt="FRM"
            className="h-16 w-auto object-contain block dark:hidden"
          />
          <img
            src="/frm-logo-light.png"
            alt="FRM"
            className="h-16 w-auto object-contain hidden dark:block"
          />
        </a>
      </div>
    </div>
  );
}

export default ContactSuccess;
