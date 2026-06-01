import React, { forwardRef } from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { gsap } from "gsap";

const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-[200] bg-black/80 transition-opacity duration-200",
      className,
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  "fixed z-[200] gap-4 bg-sidebar transition ease-in-out",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b p-6",
        bottom: "inset-x-0 bottom-0 border-t p-6",
        left: "inset-y-0 left-0 h-screen min-h-screen w-3/4 border-r sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-screen min-h-screen w-3/4 border-l sm:max-w-sm p-6",
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);

const SheetContent = forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> &
    VariantProps<typeof sheetVariants>
>(({ side = "right", className, children, ...props }, ref) => {
  const combinedRef =
    React.useRef<React.ElementRef<typeof SheetPrimitive.Content>>(null);

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
              {
                opacity: 0,
                x: side === "right" ? 100 : side === "left" ? -100 : 0,
              },
              { opacity: 1, x: 0, duration: 0.3, ease: "power1.out" },
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
  }, [side]);

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        ref={combinedRef}
        className={cn(sheetVariants({ side }), className)}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
});
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className,
    )}
    {...props}
  />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className,
    )}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
