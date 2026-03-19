import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';

export { Button } from './button';
export { Input } from './input';
export { Label } from './label';
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from './dialog';
export { Avatar, AvatarFallback, AvatarImage } from './avatar';
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
} from './select';

export { ScrollArea, ScrollBar } from './scroll-area';
export { Separator } from './separator';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card';
export { Badge, badgeVariants } from './badge';

export const Alert = ({ type = 'default', className, ...props }) => {
  const typeClasses = {
    default: 'bg-primary text-primary-foreground',
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  return (
    <div
      className={cn('p-4 rounded-md text-sm flex items-center', typeClasses[type], className)}
      {...props}
    />
  );
};
Alert.displayName = 'Alert';

export const FormField = ({ children, className, ...props }) => {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {children}
    </div>
  );
};
FormField.displayName = 'FormField';

export const FormLabel = ({ className, ...props }) => {
  return <Label className={cn('text-sm font-medium', className)} {...props} />;
};
FormLabel.displayName = 'FormLabel';

export const FormMessage = ({ error, className, ...props }) => {
  if (!error) return null;
  return (
    <p className={cn('text-sm text-red-600', className)} {...props}>
      {error}
    </p>
  );
};
FormMessage.displayName = 'FormMessage';

export const Table = React.forwardRef(({ className, ...props }, ref) => {
  return <table ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...props} />;
});
Table.displayName = 'Table';

export const TableHeader = React.forwardRef(({ className, ...props }, ref) => {
  return <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />;
});
TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef(({ className, ...props }, ref) => {
  return <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
});
TableBody.displayName = 'TableBody';

export const TableRow = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <tr
      ref={ref}
      className={cn(
        'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
        className
      )}
      {...props}
    />
  );
});
TableRow.displayName = 'TableRow';

export const TableHead = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <th
      ref={ref}
      className={cn(
        'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  );
});
TableHead.displayName = 'TableHead';

export const TableCell = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <td
      ref={ref}
      className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)}
      {...props}
    />
  );
});
TableCell.displayName = 'TableCell';
