import React, { forwardRef } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
import { gsap } from "gsap";

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => {
  const combinedRef =
    React.useRef<React.ElementRef<typeof TooltipPrimitive.Content>>(null);

  React.useImperativeHandle(ref, () => combinedRef.current!);

  React.useEffect(() => {
    if (!combinedRef.current) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-state"
        ) {
          const target = mutation.target as HTMLElement;
          const state = target.getAttribute("data-state");
          if (state === "open" && target === combinedRef.current) {
            gsap.fromTo(
              combinedRef.current,
              { opacity: 0, scale: 0.95 },
              { opacity: 1, scale: 1, duration: 0.15, ease: "power1.out" },
            );
          }
        }
      });
    });

    observer.observe(combinedRef.current, {
      attributes: true,
      attributeFilter: ["data-state"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <TooltipPrimitive.Content
      ref={combinedRef}
      sideOffset={sideOffset}
      className={cn(
        "z-[200] overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground",
        className,
      )}
      {...props}
    />
  );
});
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
