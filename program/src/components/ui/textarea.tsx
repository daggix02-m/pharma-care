import * as React from 'react';
import { cn } from '@/lib/utils';
import { useFocusAnimation } from '@/hooks/useGsapAnimation';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    const { onFocus, onBlur } = useFocusAnimation();

    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        onFocus={onFocus}
        onBlur={onBlur}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
