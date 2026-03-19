import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        'medical': 'bg-[hsl(var(--medical-teal))] text-white hover:brightness-110 shadow-sm hover:shadow-[0_4px_16px_-4px_rgba(20,184,166,0.4)]',
        'medical-outline': 'border-2 border-[hsl(var(--medical-teal))]/30 text-[hsl(var(--medical-teal))] bg-transparent hover:bg-[hsl(var(--medical-teal))]/8 hover:border-[hsl(var(--medical-teal))]/50',
        'medical-ghost': 'text-[hsl(var(--medical-teal))] hover:bg-[hsl(var(--medical-teal))]/8',
        'medical-danger': 'border-2 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 bg-transparent hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-300 dark:hover:border-red-500/50',
        'medical-success': 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow-[0_4px_16px_-4px_rgba(16,185,129,0.4)]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
        xs: 'h-7 rounded-md px-2 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp 
      className={cn(buttonVariants({ variant, size, className }))} 
      ref={ref} 
      aria-label={props['aria-label'] || props.title}
      {...props} 
    />
  );
});
Button.displayName = 'Button';

export { Button, buttonVariants };
