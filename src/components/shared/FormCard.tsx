import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

interface FormCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const FormCard = ({ title, children, className }: FormCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Animate card entrance
      tl.from(cardRef.current, {
        opacity: 0,
        y: 10,
        duration: 0.6,
        ease: "back.out(1.7)",
      });

      // Animate title with slight delay
      tl.from(
        titleRef.current,
        {
          opacity: 0,
          y: -5,
          duration: 0.4,
          ease: "power2.out",
        },
        "-=0.3",
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative w-full max-w-lg rounded-xl bg-background p-6 shadow-xl",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <h3 ref={titleRef} className="text-xl font-semibold text-foreground">
          {title}
        </h3>
      </div>

      <div className="mt-6">{children}</div>
    </div>
  );
};
