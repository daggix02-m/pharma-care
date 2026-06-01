import gsap from "gsap";

/**
 * Clean entrance animation - opacity + y translation (no glow)
 * @param element - Target element
 * @param options - Optional GSAP tween vars
 */
export const animateEntrance = (
  element: HTMLElement,
  options: gsap.TweenVars = {},
) => {
  gsap.fromTo(
    element,
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: "power1.out",
      ...options,
    },
  );
};

/**
 * Staggered reveal for lists/grids
 * @param elements - NodeList or Array of elements
 * @param delay - Stagger delay between elements (default: 0.05s)
 */
export const animateStagger = (
  elements: NodeList | ArrayLike<HTMLElement>,
  delay: number = 0.05,
) => {
  gsap.fromTo(
    elements,
    { opacity: 0, scale: 0.98 },
    {
      opacity: 1,
      scale: 1,
      duration: 0.3,
      stagger: delay,
      ease: "power1.out",
    },
  );
};

/**
 * Page transition - quick fade + translate
 * @param container - Container element
 */
export const animatePageTransition = (container: HTMLElement) => {
  const tl = gsap.timeline();
  tl.to(container, { opacity: 0, y: 10, duration: 0.2 }).to(container, {
    opacity: 1,
    y: 0,
    duration: 0.3,
    ease: "power1.out",
  });
  return tl;
};

/**
 * Hover effect - scale only (no color/shadow changes)
 * @param element - Target element
 * @param scale - Scale value (default: 1.02, max: 1.05)
 */
export const animateHover = (element: HTMLElement, scale: number = 1.02) => {
  return gsap.to(element, {
    scale: Math.min(scale, 1.05),
    duration: 0.2,
    ease: "power1.out",
  });
};

/**
 * Hover out - return to scale 1
 * @param element - Target element
 */
export const animateHoverOut = (element: HTMLElement) => {
  return gsap.to(element, {
    scale: 1,
    duration: 0.2,
    ease: "power1.out",
  });
};

/**
 * Success feedback - border color change only (Option A - no glow)
 * @param element - Target element
 * @param borderColor - Border color for success (default: #10b981)
 * @param duration - Duration of color change (default: 1000ms)
 */
export const animateSuccess = (
  element: HTMLElement,
  borderColor: string = "#10b981",
  duration: number = 1000,
) => {
  gsap.set(element, { borderColor });
  setTimeout(() => {
    gsap.set(element, { borderColor: "" });
  }, duration);
};

/**
 * Chart path animation - stroke draw (no fill glow)
 * @param path - SVG path element
 * @param duration - Animation duration (default: 1.5s)
 */
export const animateChartPath = (
  path: SVGPathElement,
  duration: number = 1.5,
) => {
  const length = path.getTotalLength();
  return gsap.fromTo(
    path,
    { strokeDasharray: `${length} ${length}`, strokeDashoffset: length },
    { strokeDashoffset: 0, duration, ease: "power1.out" },
  );
};

/**
 * Scale in from center (for donut/charts)
 * @param element - Target element
 */
export const animateScaleIn = (element: HTMLElement) => {
  return gsap.fromTo(
    element,
    { opacity: 0, scale: 0.8 },
    {
      opacity: 1,
      scale: 1,
      duration: 0.4,
      ease: "power1.out",
    },
  );
};

/**
 * X-axis translation (for table rows)
 * @param element - Target element
 */
export const animateSlideIn = (element: HTMLElement) => {
  return gsap.fromTo(
    element,
    { opacity: 0, x: -10 },
    {
      opacity: 1,
      x: 0,
      duration: 0.3,
      ease: "power1.out",
    },
  );
};

/**
 * Form focus - subtle scale only
 * @param element - Target element
 */
export const animateFocus = (element: HTMLElement) => {
  return gsap.to(element, {
    scale: 1.01,
    duration: 0.2,
    ease: "power1.out",
  });
};

/**
 * Form blur - return to scale 1
 * @param element - Target element
 */
export const animateBlur = (element: HTMLElement) => {
  return gsap.to(element, {
    scale: 1,
    duration: 0.2,
    ease: "power1.out",
  });
};

/**
 * Kill all animations on element
 * @param element - Target element
 */
export const killAnimations = (element: HTMLElement) => {
  gsap.killTweensOf(element);
  gsap.set(element, { clearProps: "all" });
};

/**
 * Get animation context for cleanup
 * @returns GSAP context object with revert function
 */
export const getAnimationContext = (scope: HTMLElement | Document | Window) => {
  const ctx = gsap.context(() => {}, scope);
  return ctx;
};
