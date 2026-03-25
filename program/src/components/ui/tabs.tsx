import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';
import { useEntranceAnimation } from '@/hooks/useGsapAnimation';
import { gsap } from 'gsap';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
  useEntranceAnimation({ ref, duration: 0.3 });
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
        className
      )}
      {...props}
    />
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  const combinedRef = React.useRef<React.ElementRef<typeof TabsPrimitive.Trigger>>(null);

  React.useImperativeHandle(ref, () => combinedRef.current!);

  React.useEffect(() => {
    if (!combinedRef.current) return;

    const handleValueChange = (newVal: string) => {
      if (combinedRef.current?.getAttribute('data-value') === newVal) {
        gsap.to(combinedRef.current, {
          scale: 1.02,
          duration: 0.2,
          ease: 'power1.out',
          yoyo: true,
          repeat: 1,
        });
      }
    };

    const parent = combinedRef.current.closest('[role="tablist"]') as HTMLElement;
    const tabsRoot = parent?.closest('[data-radix-tabs-root]') as HTMLElement;

    if (tabsRoot) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'data-state') {
            const target = mutation.target as HTMLElement;
            const newVal = target.getAttribute('data-value') || '';
            handleValueChange(newVal);
          }
        });
      });

      observer.observe(tabsRoot, {
        attributes: true,
        subtree: true,
        attributeFilter: ['data-state'],
      });

      return () => observer.disconnect();
    }
  }, []);

  return (
    <TabsPrimitive.Trigger
      ref={combinedRef}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        className
      )}
      {...props}
    />
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => {
  const combinedRef = React.useRef<React.ElementRef<typeof TabsPrimitive.Content>>(null);

  React.useImperativeHandle(ref, () => combinedRef.current!);

  React.useEffect(() => {
    if (!combinedRef.current) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-state') {
          const target = mutation.target as HTMLElement;
          const state = target.getAttribute('data-state');
          if (state === 'active' && target === combinedRef.current) {
            gsap.fromTo(
              combinedRef.current,
              { opacity: 0, y: 8 },
              { opacity: 1, y: 0, duration: 0.3, ease: 'power1.out' }
            );
          }
        }
      });
    });

    observer.observe(combinedRef.current, {
      attributes: true,
      attributeFilter: ['data-state'],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <TabsPrimitive.Content
      ref={combinedRef}
      className={cn('mt-2 focus-visible:outline-none', className)}
      {...props}
    />
  );
});
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
