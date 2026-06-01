import { useEffect, useRef } from "react";
import gsap from "gsap";

export function useStepAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current!.children,
        { opacity: 0, x: 10 },
        { opacity: 1, x: 0, duration: 0.35, stagger: 0.04, ease: "power1.out" },
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return containerRef;
}
