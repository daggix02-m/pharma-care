import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  animateEntrance,
  animateStagger,
  animateHover,
  animateHoverOut,
  animateSlideIn,
  animateFocus,
  animateBlur,
  getAnimationContext,
} from "@/lib/animations";

/**
 * Hook for entrance animations with automatic cleanup
 * @param options - Optional GSAP tween vars
 * @returns Ref to attach to target element
 */
export function useEntranceAnimation<T extends HTMLElement>(
  options: gsap.TweenVars = {},
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = getAnimationContext(ref.current);
    animateEntrance(ref.current, options);
    return () => ctx.revert();
  }, []);

  return ref;
}

/**
 * Hook for staggered animations on children
 * @param selector - CSS selector for children
 * @param delay - Stagger delay (default: 0.05s)
 * @returns Container ref
 */
export function useStaggerAnimation<T extends HTMLElement>(
  selector: string,
  delay: number = 0.05,
) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = getAnimationContext(containerRef.current);
    const elements = containerRef.current.querySelectorAll(selector);
    if (elements.length === 0) return;
    animateStagger(elements, delay);
    return () => ctx.revert();
  }, [selector, delay]);

  return containerRef;
}

/**
 * Hook for hover effects
 * @param scale - Scale value (default: 1.02)
 * @returns Handlers for onMouseEnter and onMouseLeave
 */
export function useHoverAnimation(scale: number = 1.02) {
  const onMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (e.currentTarget) {
      animateHover(e.currentTarget as HTMLElement, scale);
    }
  };

  const onMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    if (e.currentTarget) {
      animateHoverOut(e.currentTarget as HTMLElement);
    }
  };

  return { onMouseEnter, onMouseLeave };
}

/**
 * Hook for page transitions
 * @returns Ref to attach to container
 */
export function usePageTransition() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = getAnimationContext(ref.current);
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 10 },
      {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: "power1.out",
      },
    );
    return () => ctx.revert();
  }, []);

  return ref;
}

/**
 * Hook for form focus/blur animations
 * @returns Handlers for onFocus and onBlur
 */
export function useFocusAnimation() {
  const onFocus = (e: React.FocusEvent<HTMLElement>) => {
    if (e.currentTarget) {
      animateFocus(e.currentTarget as HTMLElement);
    }
  };

  const onBlur = (e: React.FocusEvent<HTMLElement>) => {
    if (e.currentTarget) {
      animateBlur(e.currentTarget as HTMLElement);
    }
  };

  return { onFocus, onBlur };
}

/**
 * Hook for table row animations
 * @returns Ref for table row
 */
export function useTableRowAnimation() {
  const ref = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = getAnimationContext(ref.current);
    animateSlideIn(ref.current);
    return () => ctx.revert();
  }, []);

  return ref;
}

/**
 * Hook for chart animations
 * @returns Ref for chart element
 */
export function useChartAnimation() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = getAnimationContext(ref.current);
    const paths = ref.current.querySelectorAll("path");
    paths.forEach((path, index) => {
      const svgPath = path as SVGPathElement;
      gsap.fromTo(
        svgPath,
        {
          strokeDasharray: `${svgPath.getTotalLength()} ${svgPath.getTotalLength()}`,
          strokeDashoffset: svgPath.getTotalLength(),
        },
        {
          strokeDashoffset: 0,
          duration: 1.5,
          ease: "power1.out",
          delay: index * 0.1,
        },
      );
    });
    return () => ctx.revert();
  }, []);

  return ref;
}

/**
 * Hook for success feedback
 * @param condition - When true, triggers success animation
 * @returns Function to trigger success animation
 */
export function useSuccessFeedback() {
  const triggerSuccess = (element: HTMLElement) => {
    return gsap.to(element, {
      scale: 1.02,
      duration: 0.2,
      ease: "power1.out",
      onComplete: () => {
        gsap.to(element, {
          scale: 1,
          duration: 0.2,
          ease: "power1.out",
        });
      },
    });
  };

  return { triggerSuccess };
}
