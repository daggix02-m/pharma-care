import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  hideText?: boolean;
}

export function Logo({ className, iconClassName, textClassName, hideText = false }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <img
        src='/favicon.png'
        alt='PharmaCare Logo'
        className={cn('h-10 w-auto object-contain', iconClassName)}
      />
      {!hideText && (
        <span
          className={cn(
            'text-xl font-bold font-display tracking-tight text-foreground',
            textClassName
          )}
        >
          PharmaCare
        </span>
      )}
    </div>
  );
}
