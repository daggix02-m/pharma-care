import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Star, ChevronLeft, ChevronRight, Quote, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-muted text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

function TestimonialsSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = useQuery(
    api.public.landingPage.getApprovedTestimonials,
    { limit: 10 },
  );
  const content = useQuery(api.public.landingPage.getLandingPageSection, {
    sectionKey: "testimonials",
  }) as any;

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (!headerRef.current || !carouselRef.current) return;

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

      gsap.fromTo(
        carouselRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: carouselRef.current,
            start: "top 80%",
            once: true,
          },
          immediateRender: true,
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    if (!testimonials || testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [testimonials]);

  const goToPrevious = () => {
    if (!testimonials) return;
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  };

  const goToNext = () => {
    if (!testimonials) return;
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  if (testimonials === undefined) {
    return (
      <section
        id="testimonials"
        className="w-full py-12 md:py-24 lg:py-32 bg-transparent scroll-mt-20"
      >
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <Skeleton className="h-6 w-24 mx-auto mb-4" />
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-64 mx-auto" />
          </div>
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null; // Hide section if no approved testimonials
  }

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-transparent via-muted/10 to-transparent scroll-mt-20"
    >
      <div className="container px-4 md:px-6">
        <div
          ref={headerRef}
          className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
        >
          <Badge className="bg-muted text-muted-foreground border-border font-display uppercase tracking-widest text-[10px]">
            Testimonials
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-foreground font-display">
            {content?.testimonialsTitle || "What Pharmacy Owners Say"}
          </h2>
          <p className="mx-auto max-w-[900px] text-muted-foreground md:text-xl font-body leading-relaxed">
            {content?.testimonialsSubtitle ||
              "Real feedback from real pharmacy owners using PharmaCare every day."}
          </p>
        </div>

        <div ref={carouselRef} className="max-w-4xl mx-auto">
          <div className="relative bg-white/50 backdrop-blur-md rounded-2xl border border-border p-8 md:p-12 shadow-lg">
            <Quote className="absolute top-6 left-6 h-12 w-12 text-primary/20" />

            <div className="flex flex-col items-center text-center">
              {/* Profile Photo */}
              <div className="relative mb-6">
                {currentTestimonial.profilePhotoUrl ? (
                  <img
                    src={currentTestimonial.profilePhotoUrl}
                    alt={currentTestimonial.ownerName}
                    className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white shadow-md">
                    <User className="h-10 w-10 text-primary" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1.5">
                  <Star className="h-3 w-3 fill-white text-white" />
                </div>
              </div>

              {/* Star Rating */}
              <div className="mb-6">
                <StarRating rating={currentTestimonial.starRating} />
              </div>

              {/* Testimonial Content */}
              <blockquote className="text-lg md:text-xl text-foreground font-body leading-relaxed mb-8 max-w-2xl">
                &ldquo;{currentTestimonial.content}&rdquo;
              </blockquote>

              {/* Author Info */}
              <div className="flex flex-col items-center">
                <p className="font-semibold text-foreground font-display">
                  {currentTestimonial.ownerName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Owner, {currentTestimonial.pharmacyName}
                </p>
              </div>
            </div>

            {/* Navigation */}
            {testimonials.length > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPrevious}
                  className="rounded-full h-10 w-10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex gap-2">
                  {testimonials.map(
                    (_: { ownerName: string }, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-2 rounded-full transition-all ${
                          index === currentIndex
                            ? "w-8 bg-primary"
                            : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                        }`}
                      />
                    ),
                  )}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNext}
                  className="rounded-full h-10 w-10"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
